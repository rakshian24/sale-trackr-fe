import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useMutation, useQuery } from "@apollo/client/react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CATEGORIES,
  CREATE_PRODUCT,
  CREATE_SALES,
  PRODUCTS,
} from "../lib/graphql";
import { getPaymentModeLabel, getUnitLabel } from "../lib/i18nFormat";

type ProductOption = {
  id: string;
  name: string;
  pluNo?: number;
  costPrice: number;
  sellingPrice: number;
  quantityUnit: "kg" | "g" | "l" | "ml" | "nos";
};
type SaleLine = ProductOption & { quantityValue: number; sellingPrice: number };
type QuickProductFieldErrors = {
  productName?: string;
  pluNo?: string;
  costPrice?: string;
  sellingPrice?: string;
  quantityValue?: string;
  categoryId?: string;
};

const filterProducts = createFilterOptions<ProductOption>({
  stringify: (option) => `${option.name} ${option.pluNo ?? ""}`,
});

export default function AddSalePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );
  const [quantityValue, setQuantityValue] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [error, setError] = useState("");
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPluNo, setNewProductPluNo] = useState<number | "">("");
  const [newProductCostPrice, setNewProductCostPrice] = useState(0);
  const [newProductSellingPrice, setNewProductSellingPrice] = useState(0);
  const [newProductQuantityValue, setNewProductQuantityValue] = useState(1);
  const [newProductQuantityUnit, setNewProductQuantityUnit] = useState<
    "kg" | "g" | "l" | "ml" | "nos"
  >("kg");
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [quickProductFieldErrors, setQuickProductFieldErrors] =
    useState<QuickProductFieldErrors>({});

  const [createSales, { loading }] = useMutation(CREATE_SALES, {
    refetchQueries: ["Sales", "DashboardStats"],
    awaitRefetchQueries: true,
  });
  const [createProduct, { loading: creatingProduct }] = useMutation(
    CREATE_PRODUCT,
    {
      refetchQueries: [{ query: PRODUCTS }],
    },
  );
  const { data: productsData } = useQuery<{
    products: Array<{
      id: string;
      name: string;
      pluNo: number;
      costPrice: number;
      sellingPrice: number;
      quantityValue: number;
      quantityUnit: "kg" | "g" | "l" | "ml" | "nos";
    }>;
  }>(PRODUCTS, { fetchPolicy: "network-only" });
  const { data: categoriesData } = useQuery<{
    categories: Array<{ id: string; name: string }>;
  }>(CATEGORIES, {
    fetchPolicy: "network-only",
  });

  const options: ProductOption[] = useMemo(
    () =>
      (productsData?.products ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        pluNo: p.pluNo,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        quantityUnit: p.quantityUnit,
      })),
    [productsData?.products],
  );
  const categories = categoriesData?.categories ?? [];
  const totalAmount = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.quantityValue * line.sellingPrice,
        0,
      ),
    [lines],
  );

  const parseNonNegativeNumber = (value: string): number | "" => {
    if (value === "") return "";
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return "";
    return parsed;
  };

  const handleSelectProduct = (product: ProductOption | null) => {
    setSelectedProduct(product);
    setSearchText(product?.name ?? "");
    if (product) {
      setSellingPrice(product.sellingPrice);
      setQuantityValue(1);
    }
  };

  const handleAddLine = () => {
    if (!selectedProduct) {
      setError(t("validation.selectValidProduct"));
      return;
    }
    if (
      quantityValue === "" ||
      sellingPrice === "" ||
      quantityValue <= 0 ||
      sellingPrice <= 0
    ) {
      setError(t("validation.quantityAndPriceRequired"));
      return;
    }
    setLines((prev) => [
      ...prev,
      { ...selectedProduct, quantityValue, sellingPrice },
    ]);
    setError("");
    setSelectedProduct(null);
    setSearchText("");
    setQuantityValue("");
    setSellingPrice("");
  };

  const handleCompleteSale = async () => {
    if (!lines.length) {
      setError(t("validation.addOneSaleItem"));
      return;
    }
    await createSales({
      variables: {
        input: {
          paymentMode,
          items: lines.map((line) => ({
            productId: line.id,
            quantityValue: line.quantityValue,
            sellingPrice: line.sellingPrice,
          })),
        },
      },
    });
    navigate("/");
  };

  const handleQuickCreateProduct = async () => {
    const nextFieldErrors: QuickProductFieldErrors = {};
    if (!newProductName.trim()) {
      nextFieldErrors.productName = t("validation.fillRequiredCreateProduct");
    }
    if (newProductPluNo === "") {
      nextFieldErrors.pluNo = t("validation.fillRequiredCreateProduct");
    }
    if (!newProductCategoryId) {
      nextFieldErrors.categoryId = t("validation.fillRequiredCreateProduct");
    }
    if (newProductCostPrice <= 0) {
      nextFieldErrors.costPrice = t("validation.costAndSellingPriceRequired");
    }
    if (newProductSellingPrice <= 0) {
      nextFieldErrors.sellingPrice = t(
        "validation.costAndSellingPriceRequired",
      );
    }
    if (newProductQuantityValue <= 0) {
      nextFieldErrors.quantityValue = t("validation.quantityAndPriceRequired");
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setQuickProductFieldErrors(nextFieldErrors);
      return;
    }
    setQuickProductFieldErrors({});
    const response = (await createProduct({
      variables: {
        input: {
          name: newProductName,
          pluNo: Number(newProductPluNo),
          costPrice: Number(newProductCostPrice),
          sellingPrice: Number(newProductSellingPrice),
          quantityValue: Number(newProductQuantityValue),
          quantityUnit: newProductQuantityUnit,
          categoryId: newProductCategoryId,
        },
      },
    })) as { data?: { createProduct?: ProductOption } };

    const created = response.data?.createProduct;
    if (created) {
      setSelectedProduct(created);
      setSearchText(created.name);
      setSellingPrice(created.sellingPrice);
      setQuantityValue(1);
      setOpenCreateProduct(false);
      setNewProductName("");
      setNewProductPluNo("");
      setNewProductCostPrice(0);
      setNewProductSellingPrice(0);
      setNewProductQuantityValue(1);
      setNewProductQuantityUnit("kg");
      setNewProductCategoryId("");
      setQuickProductFieldErrors({});
      setError("");
    }
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }} mb={5}>
      <Typography variant="h5">{t("sales.title")}</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={options}
                value={selectedProduct}
                onChange={(_, value) => handleSelectProduct(value)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                filterOptions={(opts, state) => filterProducts(opts, state)}
                inputValue={searchText}
                onInputChange={(_, value) => setSearchText(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("sales.searchOrSelectProduct")}
                    placeholder={t("sales.typeToFilter")}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-end", md: "stretch" },
              }}
            >
              <Button
                sx={{ height: "100%", width: { xs: "auto", md: "100%" } }}
                variant="text"
                onClick={() => setOpenCreateProduct(true)}
              >
                {t("sales.productNotFoundCreate")}
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={{ xs: 2, md: 3 }} mt={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={t("products.costPrice")}
                fullWidth
                value={selectedProduct?.costPrice ?? ""}
                slotProps={{ input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={t("products.sellingPrice")}
                type="number"
                fullWidth
                value={sellingPrice}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => {
                  const nextValue = parseNonNegativeNumber(e.target.value);
                  if (e.target.value !== "" && nextValue === "") return;
                  setSellingPrice(nextValue);
                }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={`${t("products.quantityValue")} (${getUnitLabel(t, selectedProduct?.quantityUnit)})`}
                type="number"
                fullWidth
                value={quantityValue}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => {
                  const nextValue = parseNonNegativeNumber(e.target.value);
                  if (e.target.value !== "" && nextValue === "") return;
                  setQuantityValue(nextValue);
                }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                sx={{ height: "100%" }}
                variant="outlined"
                onClick={handleAddLine}
              >
                {t("sales.addOneMoreSale")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog
        open={openCreateProduct}
        onClose={() => setOpenCreateProduct(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("sales.createProductTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("products.productName")}
              value={newProductName}
              onChange={(e) => {
                setNewProductName(e.target.value);
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  productName: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.productName)}
              helperText={quickProductFieldErrors.productName}
            />
            <TextField
              label={t("products.pluNo")}
              type="number"
              value={newProductPluNo}
              onChange={(e) => {
                setNewProductPluNo(
                  e.target.value === "" ? "" : Number(e.target.value),
                );
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  pluNo: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.pluNo)}
              helperText={quickProductFieldErrors.pluNo}
            />
            <TextField
              label={t("products.costPrice")}
              type="number"
              value={newProductCostPrice}
              onChange={(e) => {
                setNewProductCostPrice(Number(e.target.value));
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  costPrice: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.costPrice)}
              helperText={quickProductFieldErrors.costPrice}
            />
            <TextField
              label={t("products.sellingPrice")}
              type="number"
              value={newProductSellingPrice}
              onChange={(e) => {
                setNewProductSellingPrice(Number(e.target.value));
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  sellingPrice: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.sellingPrice)}
              helperText={quickProductFieldErrors.sellingPrice}
            />
            <TextField
              label={t("products.quantityValue")}
              type="number"
              value={newProductQuantityValue}
              onChange={(e) => {
                setNewProductQuantityValue(Number(e.target.value));
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  quantityValue: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.quantityValue)}
              helperText={quickProductFieldErrors.quantityValue}
            />
            <TextField
              select
              label={t("products.unit")}
              value={newProductQuantityUnit}
              onChange={(e) =>
                setNewProductQuantityUnit(
                  e.target.value as "kg" | "g" | "l" | "ml" | "nos",
                )
              }
              fullWidth
            >
              <MenuItem value="kg">{t("common.unit.kg")}</MenuItem>
              <MenuItem value="g">{t("common.unit.g")}</MenuItem>
              <MenuItem value="l">{t("common.unit.l")}</MenuItem>
              <MenuItem value="ml">{t("common.unit.ml")}</MenuItem>
              <MenuItem value="nos">{t("common.unit.nos")}</MenuItem>
            </TextField>
            <TextField
              select
              label={t("products.category")}
              value={newProductCategoryId}
              onChange={(e) => {
                setNewProductCategoryId(e.target.value);
                setQuickProductFieldErrors((prev) => ({
                  ...prev,
                  categoryId: undefined,
                }));
              }}
              fullWidth
              error={Boolean(quickProductFieldErrors.categoryId)}
              helperText={quickProductFieldErrors.categoryId}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenCreateProduct(false);
              setQuickProductFieldErrors({});
            }}
          >
            {t("products.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleQuickCreateProduct()}
            disabled={creatingProduct}
          >
            {t("sales.createProduct")}
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("sales.itemsCurrentBill")}
          </Typography>
          <Stack spacing={1} mb={{ xs: 1, md: 3 }}>
            {lines.map((line, idx) => (
              <Typography key={`${line.id}-${idx}`}>
                {line.name} - {line.quantityValue}
                {getUnitLabel(t, line.quantityUnit)} x ₹{line.sellingPrice} = ₹
                {(line.quantityValue * line.sellingPrice).toFixed(2)}
              </Typography>
            ))}
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography fontWeight={700} variant="h6">
              {t("sales.total", { amount: totalAmount.toFixed(2) })}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ mt: 2, alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label={t("sales.paymentMode")}
                fullWidth
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(e.target.value as "CASH" | "UPI")
                }
              >
                <MenuItem value="CASH">
                  {getPaymentModeLabel(t, "CASH")}
                </MenuItem>
                <MenuItem value="UPI">{getPaymentModeLabel(t, "UPI")}</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                onClick={() => void handleCompleteSale()}
                disabled={loading}
                sx={{ fontWeight: "600" }}
              >
                {t("sales.completeSale")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
