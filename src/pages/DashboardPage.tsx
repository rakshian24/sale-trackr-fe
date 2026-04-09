import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBasketShopping } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { getPaymentModeLabel, getUnitLabel } from "../lib/i18nFormat";
import ZeroState from "../components/ZeroState";

type SaleItem = {
  id: string;
  itemName: string;
  quantityValue: number;
  quantityUnit: string;
  paymentMode: string;
  costPrice: number;
  sellingPrice: number;
  totalPrice: number;
};

type DashboardStats = {
  cashAmount: number;
  upiAmount: number;
  totalAmount: number;
  cashTransactions: number;
  upiTransactions: number;
  topSellingItems: Array<{
    itemName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  topTransactions: Array<{
    id: string;
    itemSummary: string;
    itemCount: number;
    totalPrice: number;
    paymentMode: string;
  }>;
  recentTransactions: Array<{
    id: string;
    itemSummary: string;
    itemCount: number;
    totalPrice: number;
    paymentMode: string;
  }>;
};

type Props = {
  stats?: DashboardStats;
  sales: SaleItem[];
  datePreset:
    | "TODAY"
    | "YESTERDAY"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH";
  onDatePresetChange: (
    value:
      | "TODAY"
      | "YESTERDAY"
      | "THIS_WEEK"
      | "LAST_WEEK"
      | "THIS_MONTH"
      | "LAST_MONTH",
  ) => void;
};

export default function DashboardPage({
  stats,
  sales,
  datePreset,
  onDatePresetChange,
}: Props) {
  const { t } = useTranslation();
  const topSellingItems = stats?.topSellingItems ?? [];
  const topTransactions = stats?.topTransactions ?? [];
  const recentTransactions = stats?.recentTransactions ?? sales.slice(0, 5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack spacing={3} mb={5}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">{t("nav.dashboard")}</Typography>
        <TextField
          select
          size="small"
          value={datePreset}
          onChange={(e) =>
            onDatePresetChange(e.target.value as Props["datePreset"])
          }
          sx={{
            minWidth: 170,
            bgcolor: "white",
            borderRadius: "12px",
            boxShadow: "rgba(0, 0, 0, 0.1) 0.25px 0.5px 10px",
          }}
        >
          <MenuItem value="TODAY">{t("dashboard.datePresets.TODAY")}</MenuItem>
          <MenuItem value="YESTERDAY">
            {t("dashboard.datePresets.YESTERDAY")}
          </MenuItem>
          <MenuItem value="THIS_WEEK">
            {t("dashboard.datePresets.THIS_WEEK")}
          </MenuItem>
          <MenuItem value="LAST_WEEK">
            {t("dashboard.datePresets.LAST_WEEK")}
          </MenuItem>
          <MenuItem value="THIS_MONTH">
            {t("dashboard.datePresets.THIS_MONTH")}
          </MenuItem>
          <MenuItem value="LAST_MONTH">
            {t("dashboard.datePresets.LAST_MONTH")}
          </MenuItem>
        </TextField>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.cashAmount")}</Typography>
              <Typography variant="h5">
                ₹ {stats?.cashAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.upiAmount")}</Typography>
              <Typography variant="h5">
                ₹ {stats?.upiAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.totalAmount")}</Typography>
              <Typography variant="h5">
                ₹ {stats?.totalAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.cashTransactions")}</Typography>
              <Typography variant="h5">
                {stats?.cashTransactions ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.upiTransactions")}</Typography>
              <Typography variant="h5">
                {stats?.upiTransactions ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography>{t("dashboard.totalTransactions")}</Typography>
              <Typography variant="h5">
                {(stats?.cashTransactions ?? 0) + (stats?.upiTransactions ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" component={Link} to="/sales/new">
          {t("dashboard.addSale")}
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            {t("dashboard.topSellingItems")}
          </Typography>
          <Stack spacing={1}>
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item) => (
                <Box
                  key={item.itemName}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography>{item.itemName}</Typography>
                  <Typography>
                    ₹ {item.totalAmount.toFixed(2)} ({item.transactionCount})
                  </Typography>
                </Box>
              ))
            ) : (
              <ZeroState
                title={t("dashboard.topSellingItemsZeroState.title")}
                description={t(
                  "dashboard.topSellingItemsZeroState.description",
                )}
                icon={
                  <FaBasketShopping size={isMobile ? 50 : 80} color="#A8E2C7" />
                }
                iconBgColor={"#E9FAEF"}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            {t("dashboard.topTransactions")}
          </Typography>
          <Stack spacing={1.5}>
            {topTransactions.length > 0 ? (
              topTransactions.map((sale) => (
                <Box
                  key={sale.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: "1px solid #e7efe8",
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {t("dashboard.items")} {sale.itemSummary}
                    </Typography>
                    <Typography variant="body2">
                      {t("dashboard.itemCount", { count: sale.itemCount })} |{" "}
                      {getPaymentModeLabel(t, sale.paymentMode)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography fontWeight={700}>
                      ₹ {sale.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <ZeroState
                title={t("dashboard.topTransactionsZeroState.title")}
                description={t(
                  "dashboard.topTransactionsZeroState.description",
                )}
                icon={<FaRupeeSign size={isMobile ? 50 : 80} color="#F7DFA1" />}
                iconBgColor="#FEFCE8"
              />
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            {t("dashboard.recentTransactions")}
          </Typography>
          <Stack spacing={1.5}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((sale) => (
                <Box
                  key={sale.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: "1px solid #e7efe8",
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {t("dashboard.items")}{" "}
                      {"itemSummary" in sale ? sale.itemSummary : sale.itemName}
                    </Typography>
                    <Typography variant="body2">
                      {"itemCount" in sale
                        ? t("dashboard.itemCount", { count: sale.itemCount })
                        : `${sale.quantityValue} ${getUnitLabel(t, sale.quantityUnit)}`}{" "}
                      | {getPaymentModeLabel(t, sale.paymentMode)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography fontWeight={700}>
                      ₹ {sale.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <ZeroState
                title={t("dashboard.recentTransactionsZeroState.title")}
                description={t(
                  "dashboard.recentTransactionsZeroState.description",
                )}
                icon={
                  <FaClipboardList size={isMobile ? 50 : 80} color="#B0C9FB" />
                }
                iconBgColor="#EFF6FF"
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
