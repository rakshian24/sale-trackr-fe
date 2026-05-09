import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  createFilterOptions,
  type FilterOptionsState,
} from "@mui/material/useAutocomplete";
import { useMutation, useQuery } from "@apollo/client/react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  CATEGORIES,
  CREATE_PRODUCT,
  CREATE_PURCHASE,
  DELETE_PURCHASE,
  PRODUCTS,
  PURCHASES,
  UPDATE_PURCHASE,
} from "../lib/graphql";
import ProductCategoryAutocomplete from "../components/ProductCategoryAutocomplete";
import { getUnitLabel } from "../lib/i18nFormat";

type PurchaseUnit = "kg" | "l" | "ml" | "nos" | "bunch";

type ProductOption = {
  id: string;
  name: string;
  pluNo?: number;
  costPrice: number;
  sellingPrice: number;
  quantityUnit: "kg" | "g" | "l" | "ml" | "nos" | "bunch";
};

type CreatePromptOption = {
  id: "__create__";
  isCreate: true;
  draftName: string;
};
type CreateSourcePromptOption = {
  id: "__create_source__";
  isCreateSource: true;
  draftName: string;
};

type ComboOption = ProductOption | CreatePromptOption;
type SourceOption = string | CreateSourcePromptOption;

const filterProductsBase = createFilterOptions<ProductOption>({
  stringify: (option) => `${option.name} ${option.pluNo ?? ""}`,
});
const filterSourcesBase = createFilterOptions<string>();

function isCreateOption(option: ComboOption): option is CreatePromptOption {
  return "isCreate" in option && option.isCreate === true;
}
function isCreateSourceOption(
  option: SourceOption,
): option is CreateSourcePromptOption {
  return typeof option !== "string" && option.isCreateSource === true;
}

function formatPurchaseDateTime(
  value: string,
  locale: string,
): { date: string; time: string } {
  const trimmed = value.trim();
  const asNumber = Number(trimmed);
  const date = Number.isFinite(asNumber) && trimmed !== ""
    ? new Date(asNumber)
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return { date: value, time: "" };
  }
  const day = date.toLocaleString(locale, { day: "2-digit" });
  const month = date.toLocaleString(locale, { month: "short" });
  const year = date.toLocaleString(locale, { year: "2-digit" });
  const time = date.toLocaleString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return {
    date: `${day} ${month} ${year}`,
    time,
  };
}

function getFirstGraphQLErrorMessage(err: unknown): string | undefined {
  if (err === null || typeof err !== "object") return undefined;
  const rec = err as { graphQLErrors?: readonly { message?: string }[] };
  const first = rec.graphQLErrors?.[0]?.message;
  return typeof first === "string" ? first : undefined;
}

function toLocalDatetimeInputValue(value: string): string {
  const trimmed = value.trim();
  const asNumber = Number(trimmed);
  const date = Number.isFinite(asNumber) && trimmed !== ""
    ? new Date(asNumber)
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function PurchasesPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showForm, setShowForm] = useState(!isMobile);
  const [purchasedAt, setPurchasedAt] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [source, setSource] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );
  const [productSearchText, setProductSearchText] = useState("");
  const [purchasedQuantity, setPurchasedQuantity] = useState<number | "">("");
  const [quantityUnit, setQuantityUnit] = useState<PurchaseUnit>("kg");
  const [costPricePerUnit, setCostPricePerUnit] = useState<number | "">("");
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<number | "">(
    "",
  );
  const [error, setError] = useState("");
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [purchasePendingDeleteId, setPurchasePendingDeleteId] = useState<
    string | null
  >(null);

  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPluNo, setNewProductPluNo] = useState<number | "">("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [createProductFieldErrors, setCreateProductFieldErrors] = useState<{
    productName?: string;
    pluNo?: string;
    category?: string;
  }>({});

  const { data: productsData } = useQuery<{
    products: Array<{
      id: string;
      name: string;
      pluNo: number;
      costPrice: number;
      sellingPrice: number;
      quantityUnit: "kg" | "g" | "l" | "ml" | "nos" | "bunch";
    }>;
  }>(PRODUCTS, {
    fetchPolicy: "network-only",
  });
  const { data: purchasesData } = useQuery<{
    purchases: Array<{
      id: string;
      source: string;
      product: { id: string; name: string };
      purchasedQuantity: number;
      quantityRemaining: number;
      quantityUnit: PurchaseUnit;
      costPricePerUnit: number;
      sellingPricePerUnit: number;
      totalCost: number;
      purchasedAt: string;
    }>;
  }>(PURCHASES, { fetchPolicy: "network-only" });
  const [createPurchase, { loading: savingPurchase }] = useMutation(
    CREATE_PURCHASE,
    {
      refetchQueries: [PURCHASES, { query: PRODUCTS }],
    },
  );
  const [updatePurchase, { loading: updatingPurchase }] = useMutation(
    UPDATE_PURCHASE,
    {
      refetchQueries: [PURCHASES, { query: PRODUCTS }],
    },
  );
  const [deletePurchase, { loading: deletingPurchase }] = useMutation(
    DELETE_PURCHASE,
    {
      refetchQueries: [PURCHASES, { query: PRODUCTS }],
    },
  );
  const [createProduct, { loading: creatingProduct }] = useMutation(
    CREATE_PRODUCT,
    {
      refetchQueries: [{ query: PRODUCTS }, { query: CATEGORIES }],
    },
  );

  const productOptions: ProductOption[] = useMemo(
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

  const purchases = useMemo(
    () => purchasesData?.purchases ?? [],
    [purchasesData?.purchases],
  );
  const sourceOptions = useMemo(
    () => Array.from(new Set(purchases.map((purchase) => purchase.source))).sort(),
    [purchases],
  );
  const totalCost = useMemo(() => {
    if (purchasedQuantity === "" || costPricePerUnit === "") return 0;
    return purchasedQuantity * costPricePerUnit;
  }, [purchasedQuantity, costPricePerUnit]);
  const potentialEarning = useMemo(() => {
    if (purchasedQuantity === "" || sellingPricePerUnit === "") return null;
    return purchasedQuantity * sellingPricePerUnit;
  }, [purchasedQuantity, sellingPricePerUnit]);
  const profitPerUnit = useMemo(() => {
    if (costPricePerUnit === "" || sellingPricePerUnit === "") return null;
    return sellingPricePerUnit - costPricePerUnit;
  }, [costPricePerUnit, sellingPricePerUnit]);
  const potentialProfitPerQuantity = useMemo(() => {
    if (purchasedQuantity === "" || profitPerUnit === null) return null;
    return purchasedQuantity * profitPerUnit;
  }, [purchasedQuantity, profitPerUnit]);
  const numberInputSx = {
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
      {
        WebkitAppearance: "none",
        margin: 0,
      },
  } as const;

  const filterComboOptions = (
    options: ComboOption[],
    state: FilterOptionsState<ComboOption>,
  ): ComboOption[] => {
    const productsOnly = options.filter(
      (o): o is ProductOption => !isCreateOption(o),
    );
    const filtered = filterProductsBase(
      productsOnly,
      state as FilterOptionsState<ProductOption>,
    );
    const q = state.inputValue.trim();
    if (q.length > 0 && filtered.length === 0) {
      return [{ id: "__create__", isCreate: true, draftName: q }];
    }
    return filtered;
  };
  const filterSourceOptions = (
    options: SourceOption[],
    state: FilterOptionsState<SourceOption>,
  ): SourceOption[] => {
    const existingSources = options.filter(
      (option): option is string => typeof option === "string",
    );
    const filtered = filterSourcesBase(
      existingSources,
      state as FilterOptionsState<string>,
    );
    const q = state.inputValue.trim();
    const hasExactSource = existingSources.some(
      (sourceName) => sourceName.toLowerCase() === q.toLowerCase(),
    );
    if (q.length > 0 && !hasExactSource) {
      return [
        ...filtered,
        { id: "__create_source__", isCreateSource: true, draftName: q },
      ];
    }
    return filtered;
  };

  const applyProduct = (product: ProductOption) => {
    setSelectedProduct(product);
    setProductSearchText(product.name);
    setCostPricePerUnit(product.costPrice);
    setSellingPricePerUnit(product.sellingPrice);
    if (
      product.quantityUnit === "kg" ||
      product.quantityUnit === "l" ||
      product.quantityUnit === "ml" ||
      product.quantityUnit === "nos" ||
      product.quantityUnit === "bunch"
    ) {
      setQuantityUnit(product.quantityUnit);
    }
  };

  const handleComboChange = (_: unknown, value: ComboOption | null) => {
    if (!value) {
      setSelectedProduct(null);
      setProductSearchText("");
      return;
    }
    if (isCreateOption(value)) {
      setNewProductName(value.draftName);
      setNewProductPluNo("");
      setNewProductCategory("");
      setCreateProductFieldErrors({});
      setProductSearchText(value.draftName);
      setOpenCreateProduct(true);
      return;
    }
    applyProduct(value);
  };

  const handleCreateProductInDialog = async () => {
    const nextErrors: {
      productName?: string;
      pluNo?: string;
      category?: string;
    } = {};
    if (!newProductName.trim()) {
      nextErrors.productName = t("validation.fillRequiredCreateProduct");
    }
    if (newProductPluNo === "") {
      nextErrors.pluNo = t("validation.fillRequiredCreateProduct");
    }
    if (!newProductCategory.trim()) {
      nextErrors.category = t("validation.categoryRequired");
    }
    if (Object.keys(nextErrors).length > 0) {
      setCreateProductFieldErrors(nextErrors);
      return;
    }
    setCreateProductFieldErrors({});
    const response = (await createProduct({
      variables: {
        input: {
          name: newProductName.trim(),
          pluNo: Number(newProductPluNo),
          categoryName: newProductCategory.trim(),
        },
      },
    })) as {
      data?: {
        createProduct?: {
          id: string;
          name: string;
          pluNo: number;
          costPrice: number;
          sellingPrice: number;
          quantityUnit: ProductOption["quantityUnit"];
        };
      };
    };

    const created = response.data?.createProduct;
    if (created) {
      applyProduct({
        id: created.id,
        name: created.name,
        pluNo: created.pluNo,
        costPrice: created.costPrice,
        sellingPrice: created.sellingPrice,
        quantityUnit: created.quantityUnit,
      });
      setOpenCreateProduct(false);
      setNewProductName("");
      setNewProductPluNo("");
      setNewProductCategory("");
      setError("");
    }
  };

  const resetPurchaseForm = () => {
    setError("");
    setEditingPurchaseId(null);
    setSource("");
    setSelectedProduct(null);
    setProductSearchText("");
    setPurchasedQuantity("");
    setQuantityUnit("nos");
    setCostPricePerUnit("");
    setSellingPricePerUnit("");
  };

  const handleSavePurchase = async () => {
    if (!purchasedAt || !source.trim() || !selectedProduct) {
      setError(t("purchases.errors.requiredPurchaseFields"));
      return;
    }
    if (
      purchasedQuantity === "" ||
      costPricePerUnit === "" ||
      sellingPricePerUnit === "" ||
      purchasedQuantity <= 0 ||
      costPricePerUnit <= 0 ||
      sellingPricePerUnit <= 0
    ) {
      setError(t("purchases.errors.quantityAndPricePositive"));
      return;
    }
    const input = {
      purchasedAt: new Date(purchasedAt).toISOString(),
      source: source.trim(),
      productId: selectedProduct.id,
      purchasedQuantity: Number(purchasedQuantity),
      quantityUnit,
      costPricePerUnit: Number(costPricePerUnit),
      sellingPricePerUnit: Number(sellingPricePerUnit),
    };
    if (editingPurchaseId) {
      await updatePurchase({
        variables: {
          id: editingPurchaseId,
          input,
        },
      });
    } else {
      await createPurchase({
        variables: {
          input,
        },
      });
    }
    resetPurchaseForm();
  };

  const handleEditPurchase = (purchase: (typeof purchases)[number]) => {
    const matchedProduct = productOptions.find((option) => option.id === purchase.product.id);
    setEditingPurchaseId(purchase.id);
    setPurchasedAt(toLocalDatetimeInputValue(purchase.purchasedAt));
    setSource(purchase.source);
    setSelectedProduct(
      matchedProduct ?? {
        id: purchase.product.id,
        name: purchase.product.name,
        costPrice: purchase.costPricePerUnit,
        sellingPrice: purchase.sellingPricePerUnit,
        quantityUnit: purchase.quantityUnit,
      },
    );
    setProductSearchText(purchase.product.name);
    setPurchasedQuantity(purchase.purchasedQuantity);
    setQuantityUnit(purchase.quantityUnit);
    setCostPricePerUnit(purchase.costPricePerUnit);
    setSellingPricePerUnit(purchase.sellingPricePerUnit);
    setError("");
    setShowForm(true);
  };

  const handleDeletePurchaseClick = (id: string) => {
    setPurchasePendingDeleteId(id);
  };

  const handleDeletePurchaseConfirm = async () => {
    if (!purchasePendingDeleteId) return;
    try {
      await deletePurchase({ variables: { id: purchasePendingDeleteId } });
      setError("");
      if (editingPurchaseId === purchasePendingDeleteId) {
        setEditingPurchaseId(null);
      }
      setPurchasePendingDeleteId(null);
    } catch (err: unknown) {
      const gqlMsg = getFirstGraphQLErrorMessage(err);
      const msg =
        gqlMsg ||
        (err instanceof Error ? err.message : "") ||
        t("purchases.errors.unableDeletePurchase");
      setError(msg);
      setPurchasePendingDeleteId(null);
    }
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }} mb={5}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              sx={{ fontSize: { xs: "22px", md: "24px" }, fontWeight: 600 }}
            >
              {t("purchases.title")}
            </Typography>
            {isMobile ? (
              <IconButton
                color="primary"
                aria-label={t("purchases.addNewPurchase")}
                sx={{ border: "1px solid", borderColor: "primary.main" }}
                onClick={() => setShowForm((prev) => !prev)}
              >
                <AddIcon />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm((prev) => !prev)}
              >
                {t("purchases.addNewPurchase")}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      {showForm ? (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 3 } }}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label={t("purchases.purchaseDateAndTime")}
                  value={purchasedAt}
                  onChange={(e) => setPurchasedAt(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete<SourceOption, false, false, true>
                  freeSolo
                  options={sourceOptions}
                  value={source}
                  onChange={(_, value) => {
                    if (!value) {
                      setSource("");
                      return;
                    }
                    if (typeof value === "string") {
                      setSource(value);
                      return;
                    }
                    if (isCreateSourceOption(value)) {
                      setSource(value.draftName);
                    }
                  }}
                  inputValue={source}
                  filterOptions={filterSourceOptions}
                  getOptionLabel={(option) =>
                    isCreateSourceOption(option)
                      ? t("purchases.createSourceDropdownPrompt", {
                          term: option.draftName,
                        })
                      : option
                  }
                  onInputChange={(_, newInput, reason) => {
                    if (
                      reason === "input" ||
                      reason === "clear" ||
                      reason === "reset"
                    ) {
                      setSource(newInput);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth label={t("purchases.source")} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete<ComboOption, false, false, false>
                  options={productOptions}
                  value={selectedProduct}
                  onChange={handleComboChange}
                  inputValue={productSearchText}
                  onInputChange={(_, newInput, reason) => {
                    if (reason === "input") setProductSearchText(newInput);
                    if (reason === "clear") {
                      setProductSearchText("");
                      setSelectedProduct(null);
                    }
                    if (reason === "reset") setProductSearchText(newInput);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  getOptionLabel={(option) =>
                    isCreateOption(option)
                      ? t("purchases.createProductDropdownPrompt", {
                          term: option.draftName,
                        })
                      : option.name
                  }
                  filterOptions={filterComboOptions}
                  selectOnFocus
                  clearOnBlur={false}
                  handleHomeEndKeys
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("purchases.selectProduct")}
                      placeholder={t("purchases.searchProductPlaceholder")}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mt={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("purchases.purchasedQuantity")}
                  value={purchasedQuantity}
                  sx={numberInputSx}
                  onWheel={(e) => {
                    (e.target as HTMLInputElement).blur();
                  }}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === "") {
                      setPurchasedQuantity("");
                      return;
                    }
                    const numericValue = Number(rawValue);
                    if (numericValue <= 0) return;
                    setPurchasedQuantity(numericValue);
                  }}
                  slotProps={{ htmlInput: { min: 0.000001 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label={t("common.unitLabel")}
                  value={quantityUnit}
                  onChange={(e) =>
                    setQuantityUnit(e.target.value as PurchaseUnit)
                  }
                >
                  <MenuItem value="kg">{getUnitLabel(t, "kg")}</MenuItem>
                  <MenuItem value="l">{getUnitLabel(t, "l")}</MenuItem>
                  <MenuItem value="ml">{getUnitLabel(t, "ml")}</MenuItem>
                  <MenuItem value="nos">{getUnitLabel(t, "nos")}</MenuItem>
                  <MenuItem value="bunch">{getUnitLabel(t, "bunch")}</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("purchases.costPricePerUnit")}
                  value={costPricePerUnit}
                  sx={numberInputSx}
                  onWheel={(e) => {
                    (e.target as HTMLInputElement).blur();
                  }}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === "") {
                      setCostPricePerUnit("");
                      return;
                    }
                    const numericValue = Number(rawValue);
                    if (numericValue <= 0) return;
                    setCostPricePerUnit(numericValue);
                  }}
                  slotProps={{ htmlInput: { min: 0.000001 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("purchases.sellingPricePerUnit")}
                  value={sellingPricePerUnit}
                  sx={numberInputSx}
                  onWheel={(e) => {
                    (e.target as HTMLInputElement).blur();
                  }}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === "") {
                      setSellingPricePerUnit("");
                      return;
                    }
                    const numericValue = Number(rawValue);
                    if (numericValue <= 0) return;
                    setSellingPricePerUnit(numericValue);
                  }}
                  slotProps={{ htmlInput: { min: 0.000001 } }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mt={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: "100%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                  }}
                >
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>
                    {t("purchases.totalCost")}
                  </Typography>
                  <Typography
                    fontSize={{ xs: "18px", md: "20px" }}
                    fontWeight={600}
                    lineHeight={1.2}
                  >
                    {totalCost > 0 ? totalCost.toFixed(2) : "0.00"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: "100%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                  }}
                >
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>
                    {t("purchases.potentialEarning")}
                  </Typography>
                  <Typography
                    fontSize={{ xs: "18px", md: "20px" }}
                    fontWeight={600}
                    lineHeight={1.2}
                  >
                    {potentialEarning !== null
                      ? potentialEarning.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: "100%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                  }}
                >
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>
                    {t("purchases.profitPerUnit")}
                  </Typography>
                  <Typography
                    fontSize={{ xs: "18px", md: "20px" }}
                    fontWeight={600}
                    lineHeight={1.2}
                  >
                    {profitPerUnit !== null ? profitPerUnit.toFixed(2) : "0.00"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: "100%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                  }}
                >
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>
                    {t("purchases.potentialProfitPerQuantity")}
                  </Typography>
                  <Typography
                    fontSize={{ xs: "18px", md: "20px" }}
                    fontWeight={600}
                    lineHeight={1.2}
                  >
                    {potentialProfitPerQuantity !== null
                      ? potentialProfitPerQuantity.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "flex-end", md: "flex-end" },
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={resetPurchaseForm}
                    disabled={savingPurchase || updatingPurchase}
                  >
                    {t("purchases.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => void handleSavePurchase()}
                    disabled={savingPurchase || updatingPurchase}
                  >
                    {editingPurchaseId
                      ? t("purchases.updatePurchase")
                      : t("purchases.savePurchase")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={openCreateProduct}
        onClose={() => {
          setOpenCreateProduct(false);
          setNewProductCategory("");
          setCreateProductFieldErrors({});
        }}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("sales.createProductTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label={t("products.productName")}
              value={newProductName}
              onChange={(e) => {
                setNewProductName(e.target.value);
                setCreateProductFieldErrors((prev) => ({
                  ...prev,
                  productName: undefined,
                }));
              }}
              fullWidth
              error={Boolean(createProductFieldErrors.productName)}
              helperText={createProductFieldErrors.productName}
            />
            <TextField
              label={t("products.pluNo")}
              type="number"
              value={newProductPluNo}
              onChange={(e) => {
                setNewProductPluNo(
                  e.target.value === "" ? "" : Number(e.target.value),
                );
                setCreateProductFieldErrors((prev) => ({
                  ...prev,
                  pluNo: undefined,
                }));
              }}
              fullWidth
              error={Boolean(createProductFieldErrors.pluNo)}
              helperText={createProductFieldErrors.pluNo}
            />
            <ProductCategoryAutocomplete
              value={newProductCategory}
              onChange={setNewProductCategory}
              onInteract={() =>
                setCreateProductFieldErrors((prev) => ({
                  ...prev,
                  category: undefined,
                }))
              }
              disabled={creatingProduct}
              error={Boolean(createProductFieldErrors.category)}
              helperText={createProductFieldErrors.category}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenCreateProduct(false);
              setNewProductCategory("");
              setCreateProductFieldErrors({});
            }}
          >
            {t("products.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateProductInDialog()}
            disabled={creatingProduct}
          >
            {t("sales.createProduct")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(purchasePendingDeleteId)}
        onClose={() => setPurchasePendingDeleteId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("purchases.deletePurchase")}</DialogTitle>
        <DialogContent>
          <Typography>{t("purchases.confirmDeletePurchase")}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 3 }}>
          <Button
            onClick={() => setPurchasePendingDeleteId(null)}
            disabled={deletingPurchase}
          >
            {t("purchases.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeletePurchaseConfirm()}
            disabled={deletingPurchase}
          >
            {t("purchases.deletePurchase")}
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Typography
            sx={{
              fontSize: { xs: "20px", md: "22px" },
              fontWeight: 600,
              mb: 2,
            }}
          >
            {t("purchases.recentPurchases")}
          </Typography>
          <TableContainer>
            <Table
              size={isMobile ? "small" : "medium"}
              sx={{
                border: 1,
                borderColor: "divider",
                "& .MuiTableCell-root": {
                  border: 1,
                  borderColor: "divider",
                },
              }}
            >
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    fontWeight: 700,
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                  },
                }}
              >
                <TableRow>
                  <TableCell sx={{ minWidth: 150 }}>
                    {t("purchases.table.dateAndTime")}
                  </TableCell>
                  <TableCell>{t("purchases.table.source")}</TableCell>
                  <TableCell>{t("purchases.table.product")}</TableCell>
                  <TableCell sx={{ minWidth: 110 }}>
                    {t("purchases.table.qty")}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {t("purchases.table.remaining")}
                  </TableCell>
                  <TableCell>{t("purchases.table.costPerUnit")}</TableCell>
                  <TableCell>{t("purchases.table.totalCost")}</TableCell>
                  <TableCell>{t("purchases.table.sellingPerUnit")}</TableCell>
                  <TableCell>{t("purchases.table.potentialEarning")}</TableCell>
                  <TableCell>{t("purchases.table.profitPerUnit")}</TableCell>
                  <TableCell>
                    {t("purchases.table.potentialProfitPerQuantity")}
                  </TableCell>
                  <TableCell>{t("purchases.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => {
                  const potentialEarningValue =
                    purchase.purchasedQuantity * purchase.sellingPricePerUnit;
                  const profitPerUnitValue =
                    purchase.sellingPricePerUnit - purchase.costPricePerUnit;
                  const potentialProfitPerQuantityValue =
                    purchase.purchasedQuantity * profitPerUnitValue;

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell sx={{ minWidth: 150 }}>
                        {(() => {
                          const formatted = formatPurchaseDateTime(
                            purchase.purchasedAt,
                            i18n.language,
                          );
                          return (
                            <Box>
                              <Typography variant="body2">{formatted.date}</Typography>
                              {formatted.time ? (
                                <Typography variant="caption" color="text.secondary">
                                  {formatted.time}
                                </Typography>
                              ) : null}
                            </Box>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{purchase.source}</TableCell>
                      <TableCell>{purchase.product.name}</TableCell>
                      <TableCell sx={{ minWidth: 110 }}>
                        {purchase.purchasedQuantity}{" "}
                        {getUnitLabel(t, purchase.quantityUnit)}
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        {purchase.quantityRemaining.toFixed(
                          purchase.quantityRemaining % 1 === 0 ? 0 : 3,
                        )}{" "}
                        {getUnitLabel(t, purchase.quantityUnit)}
                      </TableCell>
                      <TableCell>
                        {purchase.costPricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell>{purchase.totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        {purchase.sellingPricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell>{potentialEarningValue.toFixed(2)}</TableCell>
                      <TableCell>{profitPerUnitValue.toFixed(2)}</TableCell>
                      <TableCell>
                        {potentialProfitPerQuantityValue.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditPurchase(purchase)}
                            aria-label={t("purchases.editPurchase")}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePurchaseClick(purchase.id)}
                            disabled={deletingPurchase}
                            aria-label={t("purchases.deletePurchase")}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
