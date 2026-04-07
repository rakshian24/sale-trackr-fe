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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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
        <Typography variant="h5" gutterBottom>
          Product
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Product Name"
            value={productName}
            onChange={(e) => onChangeProductName(e.target.value)}
            fullWidth
            error={Boolean(productFieldErrors.productName)}
            helperText={productFieldErrors.productName}
          />
          <TextField
            label="PLU No"
            type="number"
            value={productPluNo}
            onChange={(e) =>
              onChangeProductPluNo(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            fullWidth
            error={Boolean(productFieldErrors.productPluNo)}
            helperText={productFieldErrors.productPluNo}
          />
          <TextField
            label="Cost Price"
            type="number"
            value={productCostPrice}
            onChange={(e) => onChangeProductCostPrice(Number(e.target.value))}
            fullWidth
            error={Boolean(productFieldErrors.productCostPrice)}
            helperText={productFieldErrors.productCostPrice}
          />
          <TextField
            label="Selling Price"
            type="number"
            value={productSellingPrice}
            onChange={(e) =>
              onChangeProductSellingPrice(Number(e.target.value))
            }
            fullWidth
            error={Boolean(productFieldErrors.productSellingPrice)}
            helperText={productFieldErrors.productSellingPrice}
          />
          <TextField
            label="Quantity Value"
            type="number"
            value={productQuantityValue}
            onChange={(e) =>
              onChangeProductQuantityValue(Number(e.target.value))
            }
            fullWidth
            error={Boolean(productFieldErrors.productQuantityValue)}
            helperText={productFieldErrors.productQuantityValue}
          />
          <TextField
            select
            label="Unit"
            value={productQuantityUnit}
            onChange={(e) =>
              onChangeProductQuantityUnit(e.target.value as QuantityUnit)
            }
            fullWidth
          >
            <MenuItem value="kg">kg</MenuItem>
            <MenuItem value="g">g</MenuItem>
            <MenuItem value="l">l</MenuItem>
            <MenuItem value="ml">ml</MenuItem>
            <MenuItem value="nos">nos</MenuItem>
          </TextField>
          <TextField
            select
            label="Category"
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
          <Alert severity="info">
            If you do not find the right category in the list, click "Create
            Category" to add one and continue product creation.
          </Alert>
          <Button
            variant="outlined"
            onClick={() => setOpenCategoryDialog(true)}
          >
            + Create Category
          </Button>
          <Button
            variant="contained"
            onClick={() => void onSaveProduct()}
            disabled={savingProduct}
          >
            {editingProductId ? "Update Product" : "Add Product"}
          </Button>
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                border: "1px solid #e7efe8",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography>{product.name}</Typography>
                <Typography variant="body2">
                  PLU: {product.pluNo} | CP: ₹ {product.costPrice} | SP: ₹{" "}
                  {product.sellingPrice} per {product.quantityValue}{" "}
                  {product.quantityUnit} | {product.category.name}
                </Typography>
              </Box>
              <Box>
                <Button size="small" onClick={() => onEditProduct(product)}>
                  Edit
                </Button>
                <Button
                  color="error"
                  size="small"
                  onClick={() => void onDeleteProduct(product.id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={Boolean(quickCategoryFieldError)}
            helperText={quickCategoryFieldError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateCategoryFromModal()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
