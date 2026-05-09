import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery } from "@apollo/client/react";
import { useTranslation } from "react-i18next";
import { FaBasketShopping } from "react-icons/fa6";
import ZeroState from "../components/ZeroState";
import ProductCategoryAutocomplete from "../components/ProductCategoryAutocomplete";
import { CATEGORIES, CREATE_PRODUCT, PRODUCTS, PURCHASES } from "../lib/graphql";

export default function ProductsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [newProductName, setNewProductName] = useState("");
  const [newProductPluNo, setNewProductPluNo] = useState<number | "">("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [error, setError] = useState("");
  const { data, loading } = useQuery<{
    products: Array<{
      id: string;
      name: string;
      pluNo: number;
      costPrice: number;
      sellingPrice: number;
      profit: number;
      category: { id: string; name: string };
    }>;
  }>(PRODUCTS, { fetchPolicy: "network-only" });
  const { data: purchasesData } = useQuery<{
    purchases: Array<{
      product: { id: string };
      costPricePerUnit: number;
      sellingPricePerUnit: number;
      purchasedAt: string;
    }>;
  }>(PURCHASES, { fetchPolicy: "network-only" });
  const [createProduct, { loading: creatingProduct }] = useMutation(
    CREATE_PRODUCT,
    {
      refetchQueries: [
        { query: PRODUCTS },
        { query: PURCHASES },
        { query: CATEGORIES },
      ],
    },
  );

  const products = data?.products ?? [];
  const latestPurchasePriceByProductId = useMemo(() => {
    const byProductId = new Map<
      string,
      { costPrice: number; sellingPrice: number; purchasedAtTs: number }
    >();

    for (const purchase of purchasesData?.purchases ?? []) {
      const parsed = Number(purchase.purchasedAt);
      const timestamp = Number.isFinite(parsed)
        ? parsed
        : new Date(purchase.purchasedAt).getTime();
      if (Number.isNaN(timestamp)) continue;

      const existing = byProductId.get(purchase.product.id);
      if (!existing || timestamp > existing.purchasedAtTs) {
        byProductId.set(purchase.product.id, {
          costPrice: purchase.costPricePerUnit,
          sellingPrice: purchase.sellingPricePerUnit,
          purchasedAtTs: timestamp,
        });
      }
    }

    return byProductId;
  }, [purchasesData?.purchases]);

  const formatMoney = (value: number) => `₹${value.toFixed(2)}`;
  const handleCreateProduct = async () => {
    if (!newProductName.trim() || newProductPluNo === "") {
      setError(t("validation.fillRequiredCreateProduct"));
      return;
    }
    if (!newProductCategory.trim()) {
      setError(t("validation.categoryRequired"));
      return;
    }

    await createProduct({
      variables: {
        input: {
          name: newProductName.trim(),
          pluNo: Number(newProductPluNo),
          categoryName: newProductCategory.trim(),
        },
      },
    });

    setError("");
    setNewProductName("");
    setNewProductPluNo("");
    setNewProductCategory("");
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }} mb={5}>
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography
            sx={{ fontSize: { xs: "22px", md: "24px" }, fontWeight: 600 }}
            gutterBottom
            mb={2}
          >
            {t("products.title")}
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t("products.productName")}
                value={newProductName}
                onChange={(e) => {
                  setNewProductName(e.target.value);
                  setError("");
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                type="number"
                label={t("products.pluNo")}
                value={newProductPluNo}
                onChange={(e) => {
                  setNewProductPluNo(
                    e.target.value === "" ? "" : Number(e.target.value),
                  );
                  setError("");
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <ProductCategoryAutocomplete
                value={newProductCategory}
                onChange={setNewProductCategory}
                onInteract={() => setError("")}
                disabled={creatingProduct}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{ display: "flex", justifyContent: { xs: "flex-end", md: "flex-start" } }}
            >
              <Button
                variant="contained"
                onClick={() => void handleCreateProduct()}
                disabled={creatingProduct}
              >
                {t("products.addOneMoreProduct")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <ZeroState
              title={t("products.listZeroStateTitle")}
              description={t("products.listZeroStateDescription")}
              icon={
                <FaBasketShopping size={isMobile ? 50 : 80} color="#A8E2C7" />
              }
              iconBgColor="#E9FAEF"
            />
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("products.pluNo")}</TableCell>
                    <TableCell>{t("products.productName")}</TableCell>
                    <TableCell align="right">{t("products.costPrice")}</TableCell>
                    <TableCell align="right">
                      {t("products.sellingPrice")}
                    </TableCell>
                    <TableCell align="right">{t("products.profit")}</TableCell>
                    <TableCell>{t("products.category")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((row) => {
                    const latestPurchasePrice = latestPurchasePriceByProductId.get(
                      row.id,
                    );
                    const costPrice = latestPurchasePrice?.costPrice ?? 0;
                    const sellingPrice = latestPurchasePrice?.sellingPrice ?? 0;
                    const profit = sellingPrice - costPrice;

                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.pluNo}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{formatMoney(costPrice)}</TableCell>
                        <TableCell align="right">
                          {formatMoney(sellingPrice)}
                        </TableCell>
                        <TableCell align="right">{formatMoney(profit)}</TableCell>
                        <TableCell>{row.category.name}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
