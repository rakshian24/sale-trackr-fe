import { useMemo, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import {
  CATEGORIES,
  CREATE_CATEGORY,
  CREATE_PRODUCT,
  DASHBOARD_STATS,
  DELETE_CATEGORY,
  DELETE_PRODUCT,
  LOGIN,
  PRODUCTS,
  REGISTER,
  SALES,
  UPDATE_CATEGORY,
  UPDATE_PRODUCT,
} from "./lib/graphql";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import AddSalePage from "./pages/AddSalePage";

function App() {
  const apolloClient = useApolloClient();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [productName, setProductName] = useState("");
  const [productPluNo, setProductPluNo] = useState<number | "">("");
  const [productCostPrice, setProductCostPrice] = useState(0);
  const [productSellingPrice, setProductSellingPrice] = useState(0);
  const [productQuantityValue, setProductQuantityValue] = useState(1);
  const [productQuantityUnit, setProductQuantityUnit] = useState<
    "kg" | "g" | "l" | "ml" | "nos"
  >("kg");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [datePreset, setDatePreset] = useState<
    | "TODAY"
    | "YESTERDAY"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
  >("TODAY");
  const [categoryFieldError, setCategoryFieldError] = useState("");
  const [quickCategoryFieldError, setQuickCategoryFieldError] = useState("");
  const [productFieldErrors, setProductFieldErrors] = useState<{
    productName?: string;
    productPluNo?: string;
    productCostPrice?: string;
    productSellingPrice?: string;
    productQuantityValue?: string;
    productCategoryId?: string;
  }>({});

  const [register, { loading: registering }] = useMutation(REGISTER);
  const [login, { loading: loggingIn }] = useMutation(LOGIN);
  const [createCategory, { loading: savingCategory }] = useMutation(
    CREATE_CATEGORY,
    { refetchQueries: [CATEGORIES] },
  );
  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [CATEGORIES],
  });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [CATEGORIES, PRODUCTS],
  });
  const [createProduct, { loading: savingProduct }] = useMutation(
    CREATE_PRODUCT,
    { refetchQueries: [PRODUCTS] },
  );
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [PRODUCTS],
  });
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [PRODUCTS],
  });
  const { data: statsData } = useQuery<{
    dashboardStats: {
      cashAmount: number;
      upiAmount: number;
      totalAmount: number;
      cashTransactions: number;
      upiTransactions: number;
      topSellingItems: Array<{
        itemName: string;
        totalAmount: number;
        transactionCount: number;
      }>;
      topTransactions: Array<{
        id: string;
        itemSummary: string;
        itemCount: number;
        totalPrice: number;
        paymentMode: string;
      }>;
      recentTransactions: Array<{
        id: string;
        itemSummary: string;
        itemCount: number;
        totalPrice: number;
        paymentMode: string;
      }>;
    };
  }>(DASHBOARD_STATS, {
    skip: !token,
    fetchPolicy: "network-only",
    variables: { filter: { preset: datePreset } },
  });
  const { data: salesData } = useQuery<{
    sales: Array<{
      id: string;
      itemName: string;
      quantityValue: number;
      quantityUnit: string;
      paymentMode: string;
      costPrice: number;
      sellingPrice: number;
      totalPrice: number;
    }>;
  }>(SALES, { skip: !token, fetchPolicy: "network-only" });
  const { data: categoriesData } = useQuery<{
    categories: Array<{ id: string; name: string }>;
  }>(CATEGORIES, { skip: !token, fetchPolicy: "network-only" });
  const { data: productsData } = useQuery<{
    products: Array<{
      id: string;
      name: string;
      pluNo: number;
      costPrice: number;
      sellingPrice: number;
      quantityValue: number;
      quantityUnit: "kg" | "g" | "l" | "ml" | "nos";
      category: { id: string; name: string };
    }>;
  }>(PRODUCTS, { skip: !token, fetchPolicy: "network-only" });
  const stats = useMemo(() => statsData?.dashboardStats, [statsData]);
  const sales = salesData?.sales ?? [];
  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];

  const getErrorMessage = (err: unknown, fallback: string): string => {
    const message = (err as { message?: string })?.message;
    if (message && message.includes("already exists")) return message;
    if (message && message.length > 0) return message;
    return fallback;
  };

  const validateProductForm = () => {
    const nextErrors: {
      productName?: string;
      productPluNo?: string;
      productCostPrice?: string;
      productSellingPrice?: string;
      productQuantityValue?: string;
      productCategoryId?: string;
    } = {};

    if (!productName.trim())
      nextErrors.productName = "Product name is required";
    else if (productName.trim().length > 100)
      nextErrors.productName = "Product name cannot exceed 100 characters";

    if (productPluNo === "" || Number.isNaN(productPluNo))
      nextErrors.productPluNo = "PLU number is required";
    else if (productPluNo <= 0 || productPluNo > 500)
      nextErrors.productPluNo = "PLU number must be between 1 and 500";

    if (
      !Number.isFinite(productCostPrice) ||
      productCostPrice <= 0 ||
      productCostPrice > 100000
    ) {
      nextErrors.productCostPrice =
        "Cost price must be greater than 0 and less than or equal to 100000";
    }
    if (
      !Number.isFinite(productSellingPrice) ||
      productSellingPrice <= 0 ||
      productSellingPrice > 100000
    ) {
      nextErrors.productSellingPrice =
        "Selling price must be greater than 0 and less than or equal to 100000";
    }
    if (productQuantityValue <= 0 || productQuantityValue > 1000) {
      nextErrors.productQuantityValue =
        "Quantity value must be greater than 0 and less than or equal to 1000";
    }
    if (!productCategoryId)
      nextErrors.productCategoryId = "Category is required";

    setProductFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCategoryName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "Category name is required";
    if (trimmed.length > 100)
      return "Category name cannot be longer than 100 characters";
    return "";
  };

  const storeToken = async (nextToken: string) => {
    await apolloClient.clearStore();
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setError("");
    setMessage("Welcome! You are logged in.");
  };

  const handleRegister = async () => {
    try {
      const { data } = (await register({
        variables: { input: { name, shopName, email, password } },
      })) as { data?: { register?: { token: string } } };
      if (data?.register?.token) await storeToken(data.register.token);
    } catch {
      setError("Unable to register.");
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = (await login({
        variables: { input: { email, password } },
      })) as { data?: { login?: { token: string } } };
      if (data?.login?.token) await storeToken(data.login.token);
    } catch {
      setError("Invalid email or password.");
    }
  };

  const handleSaveCategory = async () => {
    const validationError = validateCategoryName(categoryName);
    if (validationError) {
      setCategoryFieldError(validationError);
      return;
    }
    try {
      if (editingCategoryId) {
        await updateCategory({
          variables: { id: editingCategoryId, input: { name: categoryName } },
        });
        setMessage("Category updated.");
      } else {
        await createCategory({ variables: { input: { name: categoryName } } });
        setMessage("Category created.");
      }
      setError("");
      setCategoryFieldError("");
      setCategoryName("");
      setEditingCategoryId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save category."));
    }
  };

  const handleEditCategory = (id: string, nameValue: string) => {
    setEditingCategoryId(id);
    setCategoryName(nameValue);
    setCategoryFieldError("");
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory({ variables: { id } });
    setMessage("Category deleted.");
  };

  const handleQuickCreateCategory = async (
    nameValue: string,
  ): Promise<string | null> => {
    const validationError = validateCategoryName(nameValue);
    if (validationError) {
      setQuickCategoryFieldError(validationError);
      return null;
    }
    try {
      const response = (await createCategory({
        variables: { input: { name: nameValue } },
      })) as {
        data?: { createCategory?: { id: string } };
      };
      const createdId = response.data?.createCategory?.id ?? null;
      if (createdId) {
        setMessage("Category created.");
        setError("");
        setQuickCategoryFieldError("");
      }
      return createdId;
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save category."));
      return null;
    }
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm()) return;
    const input = {
      name: productName,
      pluNo: Number(productPluNo),
      costPrice: Number(productCostPrice),
      sellingPrice: Number(productSellingPrice),
      quantityValue: Number(productQuantityValue),
      quantityUnit: productQuantityUnit,
      categoryId: productCategoryId,
    };
    try {
      if (editingProductId) {
        await updateProduct({ variables: { id: editingProductId, input } });
        setMessage("Product updated.");
      } else {
        await createProduct({ variables: { input } });
        setMessage("Product created.");
      }
      setError("");
      setProductFieldErrors({});
      setProductName("");
      setProductPluNo("");
      setProductCostPrice(0);
      setProductSellingPrice(0);
      setProductQuantityValue(1);
      setProductQuantityUnit("kg");
      setProductCategoryId("");
      setEditingProductId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save product."));
    }
  };

  const handleEditProduct = (product: {
    id: string;
    name: string;
    pluNo: number;
    costPrice: number;
    sellingPrice: number;
    quantityValue: number;
    quantityUnit: "kg" | "g" | "l" | "ml" | "nos";
    category: { id: string };
  }) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductPluNo(product.pluNo);
    setProductCostPrice(product.costPrice);
    setProductSellingPrice(product.sellingPrice);
    setProductQuantityValue(product.quantityValue);
    setProductQuantityUnit(product.quantityUnit);
    setProductCategoryId(product.category.id);
    setProductFieldErrors({});
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct({ variables: { id } });
    setMessage("Product deleted.");
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await apolloClient.clearStore();
    setToken(null);
    setMessage("");
  };

  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  if (!token) {
    return (
      <Box>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Sales Trackr
            </Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ py: 4 }}>
          {message ? <Alert sx={{ mb: 2 }}>{message}</Alert> : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Register
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Shop Name"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      Create account
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Login
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleLogin}
                      disabled={loggingIn}
                    >
                      Sign in
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Box>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56 } }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              onClick={closeMobileNav}
              noWrap
              sx={{
                flexGrow: 1,
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Sales Trackr
            </Typography>
            {isMobileNav ? (
              <>
                <IconButton
                  color="inherit"
                  edge="end"
                  aria-label="Open menu"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={mobileNavOpen}
                  onClose={closeMobileNav}
                >
                  <Box
                    sx={{ width: 280 }}
                    role="presentation"
                    onClick={closeMobileNav}
                  >
                    <Box sx={{ px: 2, py: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Menu
                      </Typography>
                    </Box>
                    <Divider />
                    <List dense>
                      <ListItemButton component={Link} to="/">
                        <ListItemText primary="Dashboard" />
                      </ListItemButton>
                      <ListItemButton component={Link} to="/categories">
                        <ListItemText primary="Categories" />
                      </ListItemButton>
                      <ListItemButton component={Link} to="/products">
                        <ListItemText primary="Products" />
                      </ListItemButton>
                    </List>
                    <Divider />
                    <List dense>
                      <ListItemButton
                        onClick={() => {
                          void handleLogout();
                          closeMobileNav();
                        }}
                      >
                        <ListItemText primary="Logout" />
                      </ListItemButton>
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <>
                <Button component={Link} to="/" color="inherit">
                  Dashboard
                </Button>
                <Button component={Link} to="/categories" color="inherit">
                  Categories
                </Button>
                <Button component={Link} to="/products" color="inherit">
                  Products
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container sx={{ py: 4 }}>
          {message ? <Alert sx={{ mb: 2 }}>{message}</Alert> : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  stats={stats}
                  sales={sales}
                  datePreset={datePreset}
                  onDatePresetChange={setDatePreset}
                />
              }
            />
            <Route path="/sales/new" element={<AddSalePage />} />
            <Route
              path="/categories"
              element={
                <CategoriesPage
                  categories={categories}
                  categoryName={categoryName}
                  editingCategoryId={editingCategoryId}
                  savingCategory={savingCategory}
                  onChangeCategoryName={setCategoryName}
                  onSaveCategory={handleSaveCategory}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  categoryFieldError={categoryFieldError}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  categories={categories}
                  products={products}
                  productName={productName}
                  productPluNo={productPluNo}
                  productCostPrice={productCostPrice}
                  productSellingPrice={productSellingPrice}
                  productQuantityValue={productQuantityValue}
                  productQuantityUnit={productQuantityUnit}
                  productCategoryId={productCategoryId}
                  editingProductId={editingProductId}
                  savingProduct={savingProduct}
                  onChangeProductName={setProductName}
                  onChangeProductPluNo={setProductPluNo}
                  onChangeProductCostPrice={setProductCostPrice}
                  onChangeProductSellingPrice={setProductSellingPrice}
                  onChangeProductQuantityValue={setProductQuantityValue}
                  onChangeProductQuantityUnit={setProductQuantityUnit}
                  onChangeProductCategoryId={setProductCategoryId}
                  onQuickCreateCategory={handleQuickCreateCategory}
                  onSaveProduct={handleSaveProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  productFieldErrors={productFieldErrors}
                  quickCategoryFieldError={quickCategoryFieldError}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;
