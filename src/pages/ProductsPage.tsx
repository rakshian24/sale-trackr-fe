import { useState } from "react";
import {
  Alert,
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
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getUnitLabel } from "../lib/i18nFormat";

type Category = { id: string; name: string };
type QuantityUnit = "kg" | "g" | "l" | "ml" | "nos";
type Product = {
  id: string;
  name: string;
  pluNo: number;
  costPrice: number;
  sellingPrice: number;
  quantityValue: number;
  quantityUnit: QuantityUnit;
  category: { id: string; name: string };
};

type Props = {
  categories: Category[];
  products: Product[];
  productName: string;
  productPluNo: number | "";
  productCostPrice: number;
  productSellingPrice: number;
  productQuantityValue: number;
  productQuantityUnit: QuantityUnit;
  productCategoryId: string;
  editingProductId: string | null;
  savingProduct: boolean;
  onChangeProductName: (value: string) => void;
  onChangeProductPluNo: (value: number | "") => void;
  onChangeProductCostPrice: (value: number) => void;
  onChangeProductSellingPrice: (value: number) => void;
  onChangeProductQuantityValue: (value: number) => void;
  onChangeProductQuantityUnit: (value: QuantityUnit) => void;
  onChangeProductCategoryId: (value: string) => void;
  onQuickCreateCategory: (name: string) => Promise<string | null>;
  onSaveProduct: () => Promise<void>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => Promise<void>;
  productFieldErrors: {
    productName?: string;
    productPluNo?: string;
    productCostPrice?: string;
    productSellingPrice?: string;
    productQuantityValue?: string;
    productCategoryId?: string;
  };
  quickCategoryFieldError?: string;
};

export default function ProductsPage({
  categories,
  products,
  productName,
  productPluNo,
  productCostPrice,
  productSellingPrice,
  productQuantityValue,
  productQuantityUnit,
  productCategoryId,
  editingProductId,
  savingProduct,
  onChangeProductName,
  onChangeProductPluNo,
  onChangeProductCostPrice,
  onChangeProductSellingPrice,
  onChangeProductQuantityValue,
  onChangeProductQuantityUnit,
  onChangeProductCategoryId,
  onQuickCreateCategory,
  onSaveProduct,
  onEditProduct,
  onDeleteProduct,
  productFieldErrors,
  quickCategoryFieldError,
}: Props) {
  const { t } = useTranslation();
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCreateCategoryFromModal = async () => {
    const createdId = await onQuickCreateCategory(newCategoryName);
    if (createdId) {
      onChangeProductCategoryId(createdId);
      setOpenCategoryDialog(false);
      setNewCategoryName("");
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom mb={{ xs: 2, md: 3 }}>
          {t("products.title")}
        </Typography>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("products.productName")}
                value={productName}
                onChange={(e) => onChangeProductName(e.target.value)}
                fullWidth
                error={Boolean(productFieldErrors.productName)}
                helperText={productFieldErrors.productName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("products.pluNo")}
                type="number"
                value={productPluNo}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) =>
                  onChangeProductPluNo(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                fullWidth
                sx={{
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                    {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                }}
                error={Boolean(productFieldErrors.productPluNo)}
                helperText={productFieldErrors.productPluNo}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("products.costPrice")}
                type="number"
                value={productCostPrice}
                onChange={(e) =>
                  onChangeProductCostPrice(Number(e.target.value))
                }
                fullWidth
                error={Boolean(productFieldErrors.productCostPrice)}
                helperText={productFieldErrors.productCostPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("products.sellingPrice")}
                type="number"
                value={productSellingPrice}
                onChange={(e) =>
                  onChangeProductSellingPrice(Number(e.target.value))
                }
                fullWidth
                error={Boolean(productFieldErrors.productSellingPrice)}
                helperText={productFieldErrors.productSellingPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("products.quantityValue")}
                type="number"
                value={productQuantityValue}
                onChange={(e) =>
                  onChangeProductQuantityValue(Number(e.target.value))
                }
                fullWidth
                error={Boolean(productFieldErrors.productQuantityValue)}
                helperText={productFieldErrors.productQuantityValue}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label={t("products.unit")}
                value={productQuantityUnit}
                onChange={(e) =>
                  onChangeProductQuantityUnit(e.target.value as QuantityUnit)
                }
                fullWidth
              >
                <MenuItem value="kg">{t("common.unit.kg")}</MenuItem>
                <MenuItem value="g">{t("common.unit.g")}</MenuItem>
                <MenuItem value="l">{t("common.unit.l")}</MenuItem>
                <MenuItem value="ml">{t("common.unit.ml")}</MenuItem>
                <MenuItem value="nos">{t("common.unit.nos")}</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label={t("products.category")}
                value={productCategoryId}
                onChange={(e) => onChangeProductCategoryId(e.target.value)}
                fullWidth
                error={Boolean(productFieldErrors.productCategoryId)}
                helperText={productFieldErrors.productCategoryId}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Alert severity="info">{t("products.createCategoryHint")}</Alert>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenCategoryDialog(true)}
            >
              {t("products.createCategory")}
            </Button>

            <Button
              variant="contained"
              onClick={() => void onSaveProduct()}
              disabled={savingProduct}
            >
              {editingProductId
                ? t("products.updateProduct")
                : t("products.addProduct")}
            </Button>
          </Box>
          <Stack mt={{ xs: 2, md: 3 }} spacing={2}>
            {products.map((product) => (
              <Box
                key={product.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  pl: 2,
                  border: "1px solid #e7efe8",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography>{product.name}</Typography>
                  <Typography variant="body2">
                    {t("products.details", {
                      pluNo: product.pluNo,
                      costPrice: product.costPrice,
                      sellingPrice: product.sellingPrice,
                      quantityValue: product.quantityValue,
                      quantityUnit: getUnitLabel(t, product.quantityUnit),
                      categoryName: product.category.name,
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Button size="small" onClick={() => onEditProduct(product)}>
                    {t("products.edit")}
                  </Button>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => void onDeleteProduct(product.id)}
                  >
                    {t("products.delete")}
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("products.createCategoryTitle")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("categories.categoryName")}
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={Boolean(quickCategoryFieldError)}
            helperText={quickCategoryFieldError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenCategoryDialog(false)}>
            {t("products.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateCategoryFromModal()}
          >
            {t("products.create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
