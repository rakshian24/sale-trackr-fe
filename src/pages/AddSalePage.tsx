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
import { CREATE_PRODUCT, CREATE_SALES, PRODUCTS } from "../lib/graphql";
import { getPaymentModeLabel, getUnitLabel } from "../lib/i18nFormat";

type ProductOption = {
  id: string;
  name: string;
  pluNo?: number;
  costPrice: number;
  sellingPrice: number;
  /** Stock on hand (backend `Product.quantityValue`). */
  stockOnHand: number;
  quantityUnit: "kg" | "g" | "l" | "ml" | "nos" | "bunch";
};
type SaleLine = ProductOption & { quantityValue: number; sellingPrice: number };
type QuickProductFieldErrors = {
  productName?: string;
  pluNo?: string;
};

const filterProducts = createFilterOptions<ProductOption>({
  stringify: (option) => `${option.name} ${option.pluNo ?? ""}`,
});

function getFirstGraphQLErrorMessage(err: unknown): string | undefined {
  if (err === null || typeof err !== "object") return undefined;
  const rec = err as { graphQLErrors?: readonly { message?: string }[] };
  const first = rec.graphQLErrors?.[0]?.message;
  return typeof first === "string" ? first : undefined;
}

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
  const [quickProductFieldErrors, setQuickProductFieldErrors] =
    useState<QuickProductFieldErrors>({});

  const [createSales, { loading }] = useMutation(CREATE_SALES, {
    refetchQueries: ["Sales", "DashboardStats", { query: PRODUCTS }],
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
      quantityUnit: "kg" | "g" | "l" | "ml" | "nos" | "bunch";
    }>;
  }>(PRODUCTS, { fetchPolicy: "network-only" });
  const options: ProductOption[] = useMemo(
    () =>
      (productsData?.products ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        pluNo: p.pluNo,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stockOnHand: p.quantityValue,
        quantityUnit: p.quantityUnit,
      })),
    [productsData?.products],
  );
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
      setQuantityValue(
        product.stockOnHand > 0 ? Math.min(1, product.stockOnHand) : "",
      );
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
    const alreadyQueued = lines
      .filter((l) => l.id === selectedProduct.id)
      .reduce((sum, l) => sum + l.quantityValue, 0);
    const availableNow = selectedProduct.stockOnHand - alreadyQueued;
    if (quantityValue > availableNow + 1e-6) {
      setError(t("validation.quantityExceedsStock"));
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
    const stockById = new Map(options.map((p) => [p.id, p.stockOnHand] as const));
    const needByProduct = new Map<string, number>();
    for (const line of lines) {
      needByProduct.set(
        line.id,
        (needByProduct.get(line.id) ?? 0) + line.quantityValue,
      );
    }
    for (const [productId, needed] of needByProduct.entries()) {
      const available = stockById.get(productId);
      if (
        available !== undefined &&
        needed > available + 1e-6
      ) {
        const name = lines.find((l) => l.id === productId)?.name ?? productId;
        setError(t("validation.insufficientStockForProduct", { name }));
        return;
      }
    }
    setError("");
    try {
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
    } catch (err: unknown) {
      const gqlMsg = getFirstGraphQLErrorMessage(err);
      setError(gqlMsg ?? t("validation.unableToCompleteSale"));
    }
  };

  const handleQuickCreateProduct = async () => {
    const nextFieldErrors: QuickProductFieldErrors = {};
    if (!newProductName.trim()) {
      nextFieldErrors.productName = t("validation.fillRequiredCreateProduct");
    }
    if (newProductPluNo === "") {
      nextFieldErrors.pluNo = t("validation.fillRequiredCreateProduct");
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
        },
      },
    })) as {
      data?: {
        createProduct?: {
          id: string;
          name: string;
          pluNo?: number;
          costPrice: number;
          sellingPrice: number;
          quantityValue: number;
          quantityUnit: ProductOption["quantityUnit"];
        };
      };
    };

    const created = response.data?.createProduct;
    if (created) {
      const asOption: ProductOption = {
        id: created.id,
        name: created.name,
        pluNo: created.pluNo,
        costPrice: created.costPrice,
        sellingPrice: created.sellingPrice,
        quantityUnit: created.quantityUnit,
        stockOnHand: created.quantityValue,
      };
      setSelectedProduct(asOption);
      setSearchText(asOption.name);
      setSellingPrice(asOption.sellingPrice);
      setQuantityValue(
        asOption.stockOnHand > 0 ? Math.min(1, asOption.stockOnHand) : "",
      );
      setOpenCreateProduct(false);
      setNewProductName("");
      setNewProductPluNo("");
      setQuickProductFieldErrors({});
      setError("");
    }
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }} mb={5}>
      <Typography
        sx={{ fontSize: { xs: "22px", md: "24px" }, fontWeight: 600 }}
      >
        {t("sales.title")}
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
            {selectedProduct ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("sales.stockOnHand", {
                    amount: selectedProduct.stockOnHand,
                    unit: getUnitLabel(t, selectedProduct.quantityUnit),
                  })}{" "}
                  <Box component="span" sx={{ opacity: 0.85 }}>
                    ({t("sales.fifoHint")})
                  </Box>
                </Typography>
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={`${t("sales.qtyToSell")} (${getUnitLabel(t, selectedProduct?.quantityUnit)})`}
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Button variant="outlined" onClick={handleAddLine}>
                {t("sales.addOneMoreSale")}
              </Button>
            </Box>
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
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography
            sx={{ fontSize: { xs: "20px", md: "22px" }, fontWeight: 600 }}
            gutterBottom
          >
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
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-end", md: "flex-start" },
                ml: { xs: 0, md: 1 },
              }}
            >
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
