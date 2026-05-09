import { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import {
  createFilterOptions,
  type FilterOptionsState,
} from "@mui/material/useAutocomplete";
import { useQuery } from "@apollo/client/react";
import { useTranslation } from "react-i18next";
import { CATEGORIES } from "../lib/graphql";

type CreateCategoryPromptOption = {
  id: "__create_category__";
  isCreateCategory: true;
  draftName: string;
};

type CategoryOption = string | CreateCategoryPromptOption;

const filterCategoriesBase = createFilterOptions<string>();

function isCreateCategoryOption(
  option: CategoryOption,
): option is CreateCategoryPromptOption {
  return typeof option !== "string" && option.isCreateCategory === true;
}

export type ProductCategoryAutocompleteProps = {
  value: string;
  onChange: (next: string) => void;
  onInteract?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
};

export default function ProductCategoryAutocomplete({
  value,
  onChange,
  onInteract,
  disabled,
  fullWidth = true,
  error,
  helperText,
}: ProductCategoryAutocompleteProps) {
  const { t } = useTranslation();
  const { data: categoriesData } = useQuery<{
    categories: Array<{ id: string; name: string }>;
  }>(CATEGORIES, { fetchPolicy: "network-only" });

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set((categoriesData?.categories ?? []).map((c) => c.name)),
      ).sort((a, b) => a.localeCompare(b)),
    [categoriesData?.categories],
  );

  const filterCategoryOptions = (
    options: CategoryOption[],
    state: FilterOptionsState<CategoryOption>,
  ): CategoryOption[] => {
    const existingCategories = options.filter(
      (option): option is string => typeof option === "string",
    );
    const filtered = filterCategoriesBase(
      existingCategories,
      state as FilterOptionsState<string>,
    );
    const q = state.inputValue.trim();
    const hasExactCategory = existingCategories.some(
      (name) => name.toLowerCase() === q.toLowerCase(),
    );
    if (q.length > 0 && !hasExactCategory) {
      return [
        ...filtered,
        { id: "__create_category__", isCreateCategory: true, draftName: q },
      ];
    }
    return filtered;
  };

  return (
    <Autocomplete<CategoryOption, false, false, true>
      disabled={disabled}
      freeSolo
      options={categoryOptions}
      value={value}
      onChange={(_, next) => {
        if (!next) {
          onChange("");
          return;
        }
        if (typeof next === "string") {
          onChange(next);
          return;
        }
        if (isCreateCategoryOption(next)) {
          onChange(next.draftName);
        }
      }}
      inputValue={value}
      filterOptions={filterCategoryOptions}
      getOptionLabel={(option) =>
        isCreateCategoryOption(option)
          ? t("products.createCategoryDropdownPrompt", { term: option.draftName })
          : option
      }
      onInputChange={(_, newInput, reason) => {
        if (reason === "input" || reason === "clear" || reason === "reset") {
          onChange(newInput);
          onInteract?.();
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth={fullWidth}
          label={t("products.category")}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}
