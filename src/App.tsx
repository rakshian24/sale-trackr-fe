import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_SALE, DASHBOARD_STATS, DELETE_SALE, LOGIN, REGISTER, SALES } from "./lib/graphql";

type SaleInput = {
  itemName: string;
  category: "FRUIT" | "VEGETABLE";
  quantityKg: number;
  unitPrice: number;
  soldAt: string;
};

const defaultSale: SaleInput = {
  itemName: "",
  category: "VEGETABLE",
  quantityKg: 1,
  unitPrice: 30,
  soldAt: new Date().toISOString().slice(0, 10)
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saleInput, setSaleInput] = useState<SaleInput>(defaultSale);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [register, { loading: registering }] = useMutation(REGISTER);
  const [login, { loading: loggingIn }] = useMutation(LOGIN);
  const [createSale, { loading: savingSale }] = useMutation(CREATE_SALE, { refetchQueries: [SALES, DASHBOARD_STATS] });
  const [deleteSale] = useMutation(DELETE_SALE, { refetchQueries: [SALES, DASHBOARD_STATS] });
  const { data: statsData } = useQuery<{ dashboardStats: { totalSalesAmount: number; totalOrders: number; fruitsAmount: number; vegetablesAmount: number } }>(DASHBOARD_STATS, { skip: !token });
  const { data: salesData } = useQuery<{ sales: Array<{ id: string; itemName: string; category: string; quantityKg: number; unitPrice: number; totalPrice: number }> }>(SALES, { skip: !token });
  const stats = useMemo(() => statsData?.dashboardStats, [statsData]);
  const sales = salesData?.sales ?? [];

  const storeToken = (nextToken: string) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setError("");
    setMessage("Welcome! You are logged in.");
  };

  const handleRegister = async () => {
    try {
      const { data } = await register({ variables: { input: { name, email, password } } }) as { data?: { register?: { token: string } } };
      if (data?.register?.token) storeToken(data.register.token);
    } catch {
      setError("Unable to register.");
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = await login({ variables: { input: { email, password } } }) as { data?: { login?: { token: string } } };
      if (data?.login?.token) storeToken(data.login.token);
    } catch {
      setError("Invalid email or password.");
    }
  };

  const handleCreateSale = async () => {
    await createSale({ variables: { input: saleInput } });
    setSaleInput(defaultSale);
    setMessage("Sale added successfully.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMessage("");
  };

  return (
    <Box>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Veggie & Fruit Sale Tracker
          </Typography>
          {token ? <Button color="inherit" onClick={handleLogout}>Logout</Button> : null}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        {message ? <Alert sx={{ mb: 2 }}>{message}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {!token ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card><CardContent><Typography variant="h5" gutterBottom>Register</Typography><Stack spacing={2}><TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth /><TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth /><TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth /><Button variant="contained" onClick={handleRegister} disabled={registering}>Create account</Button></Stack></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card><CardContent><Typography variant="h5" gutterBottom>Login</Typography><Stack spacing={2}><TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth /><TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth /><Button variant="contained" color="secondary" onClick={handleLogin} disabled={loggingIn}>Sign in</Button></Stack></CardContent></Card>
            </Grid>
          </Grid>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography>Total Sales</Typography><Typography variant="h5">Rs {stats?.totalSalesAmount?.toFixed(2) ?? "0.00"}</Typography></CardContent></Card></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography>Total Orders</Typography><Typography variant="h5">{stats?.totalOrders ?? 0}</Typography></CardContent></Card></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography>Fruits</Typography><Typography variant="h5">Rs {stats?.fruitsAmount?.toFixed(2) ?? "0.00"}</Typography></CardContent></Card></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography>Vegetables</Typography><Typography variant="h5">Rs {stats?.vegetablesAmount?.toFixed(2) ?? "0.00"}</Typography></CardContent></Card></Grid>
            </Grid>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Add Sale</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}><TextField label="Item" fullWidth value={saleInput.itemName} onChange={(e) => setSaleInput((p) => ({ ...p, itemName: e.target.value }))} /></Grid>
                  <Grid size={{ xs: 12, md: 2 }}><TextField select label="Category" fullWidth value={saleInput.category} onChange={(e) => setSaleInput((p) => ({ ...p, category: e.target.value as SaleInput["category"] }))}><MenuItem value="FRUIT">Fruit</MenuItem><MenuItem value="VEGETABLE">Vegetable</MenuItem></TextField></Grid>
                  <Grid size={{ xs: 12, md: 2 }}><TextField label="Qty (kg)" type="number" fullWidth value={saleInput.quantityKg} onChange={(e) => setSaleInput((p) => ({ ...p, quantityKg: Number(e.target.value) }))} /></Grid>
                  <Grid size={{ xs: 12, md: 2 }}><TextField label="Unit Price" type="number" fullWidth value={saleInput.unitPrice} onChange={(e) => setSaleInput((p) => ({ ...p, unitPrice: Number(e.target.value) }))} /></Grid>
                  <Grid size={{ xs: 12, md: 2 }}><TextField label="Sold date" type="date" fullWidth value={saleInput.soldAt} onChange={(e) => setSaleInput((p) => ({ ...p, soldAt: e.target.value }))} /></Grid>
                  <Grid size={{ xs: 12, md: 1 }}><Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={handleCreateSale} disabled={savingSale}>Add</Button></Grid>
                </Grid>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Recent Sales</Typography>
                <Stack spacing={1.5}>
                  {sales.map((sale: { id: string; itemName: string; category: string; quantityKg: number; unitPrice: number; totalPrice: number }) => (
                    <Box key={sale.id} sx={{ display: "flex", justifyContent: "space-between", p: 1.5, border: "1px solid #e7efe8", borderRadius: 2 }}>
                      <Box><Typography fontWeight={600}>{sale.itemName} ({sale.category})</Typography><Typography variant="body2">{sale.quantityKg} kg x Rs {sale.unitPrice}</Typography></Box>
                      <Box textAlign="right"><Typography fontWeight={700}>Rs {sale.totalPrice.toFixed(2)}</Typography><Button color="error" size="small" onClick={() => void deleteSale({ variables: { id: sale.id } })}>Delete</Button></Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default App;
