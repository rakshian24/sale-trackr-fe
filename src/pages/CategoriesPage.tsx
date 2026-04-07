import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  categoryName: string;
  editingCategoryId: string | null;
  savingCategory: boolean;
  onChangeCategoryName: (value: string) => void;
  onSaveCategory: () => Promise<void>;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => Promise<void>;
  categoryFieldError?: string;
};

export default function CategoriesPage({
  categories,
  categoryName,
  editingCategoryId,
  savingCategory,
  onChangeCategoryName,
  onSaveCategory,
  onEditCategory,
  onDeleteCategory,
  categoryFieldError
}: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Category</Typography>
        <Stack spacing={2}>
          <TextField label="Category Name" value={categoryName} onChange={(e) => onChangeCategoryName(e.target.value)} fullWidth error={Boolean(categoryFieldError)} helperText={categoryFieldError} />
          <Button variant="contained" onClick={() => void onSaveCategory()} disabled={savingCategory}>
            {editingCategoryId ? "Update Category" : "Add Category"}
          </Button>
          {categories.map((category) => (
            <Box key={category.id} sx={{ display: "flex", justifyContent: "space-between", p: 1, border: "1px solid #e7efe8", borderRadius: 2 }}>
              <Typography>{category.name}</Typography>
              <Box>
                <Button size="small" onClick={() => onEditCategory(category.id, category.name)}>Edit</Button>
                <Button color="error" size="small" onClick={() => void onDeleteCategory(category.id)}>Delete</Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
