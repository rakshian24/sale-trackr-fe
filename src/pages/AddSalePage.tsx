import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
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
} from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORIES,
  CREATE_PRODUCT,
  CREATE_SALES,
  PRODUCTS,
} from "../lib/graphql";

type ProductOption = {
  id: string;
  name: string;
  pluNo?: number;
  costPrice: number;
  sellingPrice: number;
  quantityUnit: "kg" | "g" | "l" | "ml" | "nos";
};
type SaleLine = ProductOption & { quantityValue: number; sellingPrice: number };

const filterProducts = createFilterOptions<ProductOption>({
  stringify: (option) => `${option.name} ${option.pluNo ?? ""}`,
});

export default function AddSalePage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );
  const [quantityValue, setQuantityValue] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(0);
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
      setError("Please select a valid product from search.");
      return;
    }
    if (quantityValue <= 0 || sellingPrice <= 0) {
      setError("Quantity and selling price must be greater than 0.");
      return;
    }
    setLines((prev) => [
      ...prev,
      { ...selectedProduct, quantityValue, sellingPrice },
    ]);
    setError("");
    setSelectedProduct(null);
    setSearchText("");
    setQuantityValue(1);
  };

  const handleCompleteSale = async () => {
    if (!lines.length) {
      setError("Add at least one sale item.");
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
    if (
      !newProductName.trim() ||
      newProductPluNo === "" ||
      !newProductCategoryId
    ) {
      setError("Please fill all required fields to create product.");
      return;
    }
    if (newProductCostPrice <= 0 || newProductSellingPrice <= 0) {
      setError("Cost price and selling price must be greater than 0.");
      return;
    }
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
      setError("");
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Add Sale</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
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
                    label="Search or select product"
                    placeholder="Type to filter…"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                sx={{ height: "100%" }}
                variant="text"
                onClick={() => setOpenCreateProduct(true)}
              >
                Product not found? Create
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Cost Price"
                fullWidth
                value={selectedProduct?.costPrice ?? ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Selling Price"
                type="number"
                fullWidth
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label={`Quantity (${selectedProduct?.quantityUnit ?? "-"})`}
                type="number"
                fullWidth
                value={quantityValue}
                onChange={(e) => setQuantityValue(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                sx={{ height: "100%" }}
                variant="outlined"
                onClick={handleAddLine}
              >
                Add One More Sale
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog
        open={openCreateProduct}
        onClose={() => setOpenCreateProduct(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              fullWidth
            />
            <TextField
              label="PLU No"
              type="number"
              value={newProductPluNo}
              onChange={(e) =>
                setNewProductPluNo(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              fullWidth
            />
            <TextField
              label="Cost Price"
              type="number"
              value={newProductCostPrice}
              onChange={(e) => setNewProductCostPrice(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Selling Price"
              type="number"
              value={newProductSellingPrice}
              onChange={(e) =>
                setNewProductSellingPrice(Number(e.target.value))
              }
              fullWidth
            />
            <TextField
              label="Quantity Value"
              type="number"
              value={newProductQuantityValue}
              onChange={(e) =>
                setNewProductQuantityValue(Number(e.target.value))
              }
              fullWidth
            />
            <TextField
              select
              label="Unit"
              value={newProductQuantityUnit}
              onChange={(e) =>
                setNewProductQuantityUnit(
                  e.target.value as "kg" | "g" | "l" | "ml" | "nos",
                )
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
              value={newProductCategoryId}
              onChange={(e) => setNewProductCategoryId(e.target.value)}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateProduct(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleQuickCreateProduct()}
            disabled={creatingProduct}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items in Current Bill
          </Typography>
          <Stack spacing={1}>
            {lines.map((line, idx) => (
              <Typography key={`${line.id}-${idx}`}>
                {line.name} - {line.quantityValue} {line.quantityUnit} x ₹{" "}
                {line.sellingPrice} = ₹{" "}
                {(line.quantityValue * line.sellingPrice).toFixed(2)}
              </Typography>
            ))}
          </Stack>
          <Typography sx={{ mt: 2 }} fontWeight={700}>
            Total: ₹ {totalAmount.toFixed(2)}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Payment Mode"
                fullWidth
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(e.target.value as "CASH" | "UPI")
                }
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                onClick={() => void handleCompleteSale()}
                disabled={loading}
              >
                Complete Sale
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
