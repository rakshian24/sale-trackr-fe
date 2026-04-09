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
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "./i18n";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import AddSalePage from "./pages/AddSalePage";

function App() {
  const { t, i18n } = useTranslation();
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
  const language = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;

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
      nextErrors.productName = t("validation.productNameRequired");
    else if (productName.trim().length > 100)
      nextErrors.productName = t("validation.productNameMax");

    if (productPluNo === "" || Number.isNaN(productPluNo))
      nextErrors.productPluNo = t("validation.pluRequired");
    else if (productPluNo <= 0 || productPluNo > 500)
      nextErrors.productPluNo = t("validation.pluRange");

    if (
      !Number.isFinite(productCostPrice) ||
      productCostPrice <= 0 ||
      productCostPrice > 100000
    ) {
      nextErrors.productCostPrice = t("validation.costPriceRange");
    }
    if (
      !Number.isFinite(productSellingPrice) ||
      productSellingPrice <= 0 ||
      productSellingPrice > 100000
    ) {
      nextErrors.productSellingPrice = t("validation.sellingPriceRange");
    }
    if (productQuantityValue <= 0 || productQuantityValue > 1000) {
      nextErrors.productQuantityValue = t("validation.quantityValueRange");
    }
    if (!productCategoryId)
      nextErrors.productCategoryId = t("validation.categoryRequired");

    setProductFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCategoryName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return t("validation.categoryNameRequired");
    if (trimmed.length > 100) return t("validation.categoryNameMax");
    return "";
  };

  const storeToken = async (nextToken: string) => {
    await apolloClient.clearStore();
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setError("");
    setMessage(t("auth.welcome"));
  };

  const handleRegister = async () => {
    try {
      const { data } = (await register({
        variables: { input: { name, shopName, email, password } },
      })) as { data?: { register?: { token: string } } };
      if (data?.register?.token) await storeToken(data.register.token);
    } catch {
      setError(t("auth.unableRegister"));
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = (await login({
        variables: { input: { email, password } },
      })) as { data?: { login?: { token: string } } };
      if (data?.login?.token) await storeToken(data.login.token);
    } catch {
      setError(t("auth.invalidLogin"));
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
        setMessage(t("messages.categoryUpdated"));
      } else {
        await createCategory({ variables: { input: { name: categoryName } } });
        setMessage(t("messages.categoryCreated"));
      }
      setError("");
      setCategoryFieldError("");
      setCategoryName("");
      setEditingCategoryId(null);
    } catch (err) {
      setError(getErrorMessage(err, t("messages.unableSaveCategory")));
    }
  };

  const handleEditCategory = (id: string, nameValue: string) => {
    setEditingCategoryId(id);
    setCategoryName(nameValue);
    setCategoryFieldError("");
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory({ variables: { id } });
    setMessage(t("messages.categoryDeleted"));
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
        setMessage(t("messages.categoryCreated"));
        setError("");
        setQuickCategoryFieldError("");
      }
      return createdId;
    } catch (err) {
      setError(getErrorMessage(err, t("messages.unableSaveCategory")));
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
        setMessage(t("messages.productUpdated"));
      } else {
        await createProduct({ variables: { input } });
        setMessage(t("messages.productCreated"));
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
      setError(getErrorMessage(err, t("messages.unableSaveProduct")));
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
    setMessage(t("messages.productDeleted"));
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await apolloClient.clearStore();
    setToken(null);
    setMessage("");
  };

  const handleLanguageChange = async (nextLanguage: SupportedLanguage) => {
    localStorage.setItem("language", nextLanguage);
    await i18n.changeLanguage(nextLanguage);
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
            <Typography
              sx={{
                flexGrow: 1,
                fontSize: { xs: "22px", md: "24px" },
                fontWeight: "600",
              }}
            >
              {t("appName")}
            </Typography>
            <TextField
              select
              size="small"
              value={language}
              onChange={(e) =>
                void handleLanguageChange(e.target.value as SupportedLanguage)
              }
              sx={{ minWidth: 130, bgcolor: "white", borderRadius: 1 }}
              aria-label={t("language")}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang === "en"
                    ? t("langEnglish")
                    : lang === "hi"
                      ? t("langHindi")
                      : t("langKannada")}
                </MenuItem>
              ))}
            </TextField>
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
                    {t("auth.register")}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label={t("auth.name")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label={t("auth.shopName")}
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label={t("auth.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label={t("auth.password")}
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
                      {t("auth.createAccount")}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {t("auth.login")}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label={t("auth.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label={t("auth.password")}
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
                      {t("auth.signIn")}
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
          <Container>
            <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 65 } }}>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                onClick={closeMobileNav}
                noWrap
                sx={{
                  flexGrow: isMobileNav ? 1 : 0,
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginRight: 4,
                  fontSize: { xs: "22px", md: "24px" },
                }}
              >
                {t("appName")}
              </Typography>
              {isMobileNav ? (
                <>
                  <TextField
                    select
                    size="small"
                    value={language}
                    onChange={(e) =>
                      void handleLanguageChange(
                        e.target.value as SupportedLanguage,
                      )
                    }
                    sx={{
                      minWidth: 110,
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        color: "white",
                        fontSize: { xs: "14px", md: "16px" },
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                        fontSize: { xs: "14px", md: "16px" },
                      },
                    }}
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              "& .MuiMenuItem-root": {
                                fontSize: { xs: "14px", md: "16px" },
                              },
                            },
                          },
                        },
                      },
                    }}
                    aria-label={t("language")}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang === "en"
                          ? t("langEnglish")
                          : lang === "hi"
                            ? t("langHindi")
                            : t("langKannada")}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    color="inherit"
                    edge="end"
                    aria-label={t("nav.openMenu")}
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
                        <Typography variant="subtitle1" color="text.secondary">
                          {t("nav.menu")}
                        </Typography>
                      </Box>
                      <Divider />
                      <List dense>
                        <ListItemButton component={Link} to="/">
                          <ListItemText
                            primary={t("nav.dashboard")}
                            slotProps={{
                              primary: {
                                fontSize: "16px",
                              },
                            }}
                          />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/categories">
                          <ListItemText
                            primary={t("nav.categories")}
                            slotProps={{
                              primary: {
                                fontSize: "16px",
                              },
                            }}
                          />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/products">
                          <ListItemText
                            primary={t("nav.products")}
                            slotProps={{
                              primary: {
                                fontSize: "16px",
                              },
                            }}
                          />
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
                          <ListItemText
                            primary={t("nav.logout")}
                            slotProps={{
                              primary: {
                                fontSize: "16px",
                              },
                            }}
                          />
                        </ListItemButton>
                      </List>
                    </Box>
                  </Drawer>
                </>
              ) : (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button component={Link} to="/" color="inherit">
                      {t("nav.dashboard")}
                    </Button>
                    <Button component={Link} to="/categories" color="inherit">
                      {t("nav.categories")}
                    </Button>
                    <Button component={Link} to="/products" color="inherit">
                      {t("nav.products")}
                    </Button>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <TextField
                    select
                    size="small"
                    value={language}
                    onChange={(e) =>
                      void handleLanguageChange(
                        e.target.value as SupportedLanguage,
                      )
                    }
                    sx={{
                      minWidth: 130,
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderRadius: 1,
                      "& .MuiInputBase-input": { color: "white" },
                      "& .MuiSvgIcon-root": { color: "white" },
                    }}
                    aria-label={t("language")}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang === "en"
                          ? t("langEnglish")
                          : lang === "hi"
                            ? t("langHindi")
                            : t("langKannada")}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button color="inherit" onClick={handleLogout}>
                    {t("nav.logout")}
                  </Button>
                </>
              )}
            </Toolbar>
          </Container>
        </AppBar>
        <Container sx={{ py: { xs: 2, md: 4 } }}>
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
