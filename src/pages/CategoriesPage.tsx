import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

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
  categoryFieldError,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom mb={{ xs: 2, md: 3 }}>
          {t("categories.title")}
        </Typography>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("categories.categoryName")}
                value={categoryName}
                onChange={(e) => onChangeCategoryName(e.target.value)}
                fullWidth
                error={Boolean(categoryFieldError)}
                helperText={categoryFieldError}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-end", md: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => void onSaveCategory()}
                  disabled={savingCategory}
                >
                  {editingCategoryId
                    ? t("categories.updateCategory")
                    : t("categories.addCategory")}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Stack spacing={2} marginTop={"24px !important"}>
            {categories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  px: 2,
                  border: "1px solid #e7efe8",
                  borderRadius: 2,
                }}
              >
                <Typography>{category.name}</Typography>
                <Box>
                  <Button
                    size="small"
                    onClick={() => onEditCategory(category.id, category.name)}
                  >
                    {t("categories.edit")}
                  </Button>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => void onDeleteCategory(category.id)}
                  >
                    {t("categories.delete")}
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
