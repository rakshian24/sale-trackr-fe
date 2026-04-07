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
} from "@mui/material";
import { Link } from "react-router-dom";

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
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Dashboard</Typography>
        <TextField
          select
          size="small"
          value={datePreset}
          onChange={(e) =>
            onDatePresetChange(e.target.value as Props["datePreset"])
          }
          sx={{ minWidth: 170, bgcolor: "white" }}
        >
          <MenuItem value="TODAY">Today</MenuItem>
          <MenuItem value="YESTERDAY">Yesterday</MenuItem>
          <MenuItem value="THIS_WEEK">This Week</MenuItem>
          <MenuItem value="LAST_WEEK">Last Week</MenuItem>
          <MenuItem value="THIS_MONTH">This Month</MenuItem>
          <MenuItem value="LAST_MONTH">Last Month</MenuItem>
        </TextField>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>Total Amount</Typography>
              <Typography variant="h5">
                ₹ {stats?.totalAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>Cash Amount</Typography>
              <Typography variant="h5">
                ₹ {stats?.cashAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>UPI Amount</Typography>
              <Typography variant="h5">
                ₹ {stats?.upiAmount?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>Cash Txn</Typography>
              <Typography variant="h5">
                {stats?.cashTransactions ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography>UPI Txn</Typography>
              <Typography variant="h5">
                {stats?.upiTransactions ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" component={Link} to="/sales/new">
          Add Sale
        </Button>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top 5 Selling Items
          </Typography>
          <Stack spacing={1}>
            {(stats?.topSellingItems ?? []).map((item) => (
              <Box
                key={item.itemName}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography>{item.itemName}</Typography>
                <Typography>
                  ₹ {item.totalAmount.toFixed(2)} ({item.transactionCount})
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Top 5 Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Highest bill totals in the selected period
          </Typography>
          <Stack spacing={1.5}>
            {(stats?.topTransactions ?? []).map((sale) => (
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
                  <Typography fontWeight={600}>Items: {sale.itemSummary}</Typography>
                  <Typography variant="body2">
                    {sale.itemCount} item(s) | {sale.paymentMode}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontWeight={700}>
                    ₹ {sale.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Recent 5 Transactions
          </Typography>
          <Stack spacing={1.5}>
            {(stats?.recentTransactions ?? sales.slice(0, 5)).map((sale) => (
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
                    Items:{" "}
                    {"itemSummary" in sale ? sale.itemSummary : sale.itemName}
                  </Typography>
                  <Typography variant="body2">
                    {"itemCount" in sale
                      ? `${sale.itemCount} item(s)`
                      : `${sale.quantityValue} ${sale.quantityUnit}`}{" "}
                    | {sale.paymentMode}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontWeight={700}>
                    ₹ {sale.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
