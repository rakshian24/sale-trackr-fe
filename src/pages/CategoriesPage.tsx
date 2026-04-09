import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaPencil } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";

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
        <Typography
          sx={{ fontSize: { xs: "22px", md: "24px" }, fontWeight: 600 }}
          gutterBottom
          mb={{ xs: 2, md: 3 }}
        >
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
                <Box sx={{ display: "flex", gap: { xs: 1, md: 2 } }}>
                  <IconButton
                    size="small"
                    onClick={() => onEditCategory(category.id, category.name)}
                    sx={{
                      bgcolor: "primary.50",
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.100" },
                      p: 1.5,
                    }}
                  >
                    <FaPencil />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => void onDeleteCategory(category.id)}
                    sx={{
                      bgcolor: "error.50",
                      color: "error.main",
                      "&:hover": { bgcolor: "error.100" },
                      p: 1.5,
                    }}
                  >
                    <FaTrashAlt />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
