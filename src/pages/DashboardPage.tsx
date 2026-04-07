import { Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";

type SaleInput = {
  itemName: string;
  category: "FRUIT" | "VEGETABLE";
  quantityKg: number;
  unitPrice: number;
  soldAt: string;
};

type SaleItem = {
  id: string;
  itemName: string;
  category: string;
  quantityKg: number;
  unitPrice: number;
  totalPrice: number;
};

type DashboardStats = {
  totalSalesAmount: number;
  totalOrders: number;
  fruitsAmount: number;
  vegetablesAmount: number;
};

type Props = {
  stats?: DashboardStats;
  sales: SaleItem[];
  saleInput: SaleInput;
  savingSale: boolean;
  onChangeSaleInput: (next: SaleInput) => void;
  onCreateSale: () => Promise<void>;
  onDeleteSale: (id: string) => Promise<void>;
};

export default function DashboardPage({
  stats,
  sales,
  saleInput,
  savingSale,
  onChangeSaleInput,
  onCreateSale,
  onDeleteSale
}: Props) {
  return (
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
            <Grid size={{ xs: 12, md: 3 }}><TextField label="Item" fullWidth value={saleInput.itemName} onChange={(e) => onChangeSaleInput({ ...saleInput, itemName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField select label="Category" fullWidth value={saleInput.category} onChange={(e) => onChangeSaleInput({ ...saleInput, category: e.target.value as SaleInput["category"] })}><MenuItem value="FRUIT">Fruit</MenuItem><MenuItem value="VEGETABLE">Vegetable</MenuItem></TextField></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField label="Qty (kg)" type="number" fullWidth value={saleInput.quantityKg} onChange={(e) => onChangeSaleInput({ ...saleInput, quantityKg: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField label="Unit Price" type="number" fullWidth value={saleInput.unitPrice} onChange={(e) => onChangeSaleInput({ ...saleInput, unitPrice: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField label="Sold date" type="date" fullWidth value={saleInput.soldAt} onChange={(e) => onChangeSaleInput({ ...saleInput, soldAt: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 1 }}><Button fullWidth sx={{ height: "100%" }} variant="contained" onClick={() => void onCreateSale()} disabled={savingSale}>Add</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Recent Sales</Typography>
          <Stack spacing={1.5}>
            {sales.map((sale) => (
              <Box key={sale.id} sx={{ display: "flex", justifyContent: "space-between", p: 1.5, border: "1px solid #e7efe8", borderRadius: 2 }}>
                <Box><Typography fontWeight={600}>{sale.itemName} ({sale.category})</Typography><Typography variant="body2">{sale.quantityKg} kg x Rs {sale.unitPrice}</Typography></Box>
                <Box textAlign="right"><Typography fontWeight={700}>Rs {sale.totalPrice.toFixed(2)}</Typography><Button color="error" size="small" onClick={() => void onDeleteSale(sale.id)}>Delete</Button></Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
