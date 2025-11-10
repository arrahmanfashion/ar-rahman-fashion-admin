// src/components/sr/OrdersTable.tsx
"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux"; // Get user info
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Eye, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useGetMyOrdersQuery } from "@/redux/featured/order/orderApi"; // ✅ Use my orders endpoint
import { useGetSettingsQuery } from "@/redux/featured/settings/settingsApi";

// Format BDT
function formatBDT(n: number) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return "৳ " + new Intl.NumberFormat("en-BD").format(n);
  }
}

// Status badge style
function toStatusBadge(status: string) {
  const base = "border font-medium capitalize";
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    "at-local-facility": "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    other: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return `${base} ${map[status] || map.other}`;
}

function OrderModal({
  order,
  isOpen,
  onClose,
  deliveryCharge,
}: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  deliveryCharge: number;
}) {
  if (!order) return null;

  const items = order.orderInfo || [];
  const status = order.status || "other";

  // Print handler - generates REAL RETAIL RECEIPT for customer
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order._id}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page { 
              size: 80mm 297mm;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body {
            font-family: 'Courier New', 'Courier', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
          }
          
          .receipt {
            width: 100%;
          }
          
          /* Header */
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .shop-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          
          .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
          }
          
          .date-time {
            font-size: 11px;
            margin-top: 5px;
          }
          
          /* Info Section */
          .info-section {
            margin: 10px 0;
            font-size: 11px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            word-wrap: break-word;
          }
          
          .info-label {
            font-weight: bold;
            min-width: 80px;
          }
          
          .info-value {
            text-align: right;
            flex: 1;
          }
          
          /* Divider */
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          
          .divider-solid {
            border-top: 2px solid #000;
            margin: 10px 0;
          }
          
          /* Products */
          .products {
            margin: 10px 0;
          }
          
          .product-item {
            margin-bottom: 10px;
          }
          
          .product-name {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          
          .product-line {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 2px 0;
          }
          
          .product-details {
            font-size: 11px;
            color: #333;
          }
          
          /* Totals */
          .totals {
            margin-top: 10px;
            border-top: 2px solid #000;
            padding-top: 8px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          
          .grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 8px 0;
            margin: 8px 0;
          }
          
          /* Footer */
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          
          .footer-line {
            margin: 3px 0;
          }
          
          .barcode {
            text-align: center;
            margin: 10px 0;
            font-size: 10px;
            letter-spacing: 2px;
          }
          
          .thank-you {
            font-weight: bold;
            margin-top: 10px;
            font-size: 12px;
          }
          
          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border: 1px solid #000;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header -->
          <div class="header">
            <div class="shop-name">Rahman Fashion</div>
            <div style="font-size: 10px; margin: 3px 0;">Beside Dhaka-Ctg Highway,Fateh pur,Feni Sadar,Feni.</div>
            <div style="font-size: 10px;">Phone:+8801810-185636</div>
            <div class="receipt-title">*** SALES RECEIPT ***</div>
            <div class="date-time">${new Date(order.createdAt).toLocaleString(
              "en-BD",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            )}</div>
          </div>

          <!-- Order Info -->
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Receipt #:</span>
              <span class="info-value">${order._id
                .substring(order._id.length - 8)
                .toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer:</span>
              <span class="info-value">${order.customerInfo.firstName} ${
      order.customerInfo.lastName
    }</span>
            </div>
            ${
              order.customerInfo.phone
                ? `
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${order.customerInfo.phone}</span>
            </div>
            `
                : ""
            }
            <div class="info-row">
              <span class="info-label">Payment:</span>
              <span class="info-value" style="text-transform: uppercase;">${
                order.paymentInfo
              }</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value"><span class="status-badge">${status}</span></span>
            </div>
          </div>

          <div class="divider-solid"></div>

          <!-- Products -->
          <div class="products">
            <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">ITEMS PURCHASED</div>
            ${items
              .map((item: any, idx: number) => {
                const product = item.productInfo || {};
                const desc = product.description || {};
                const total = item.totalAmount || {};
                const qty = item.quantity || 1;
                const price = item.selectedPrice;

                return `
                <div class="product-item">
                  <div class="product-name">${idx + 1}. ${desc.name}</div>
                  <div class="product-line">
                    <span>${formatBDT(price)} x ${qty}</span>
                    <span style="font-weight: bold;">${formatBDT(
                      total.total
                    )}</span>
                  </div>
                  ${
                    total.subTotal !== total.total
                      ? `
                  <div class="product-details">
                    <div class="product-line">
                      <span>  Subtotal:</span>
                      <span>${formatBDT(total.subTotal)}</span>
                    </div>
                  </div>
                  `
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
          </div>
          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span>SUBTOTAL:</span>
              <span>${formatBDT(
                items.reduce(
                  (sum: number, item: any) =>
                    sum + (item.totalAmount?.subTotal || 0),
                  0
                )
              )}</span>
            </div>
            ${
              items.some(
                (item: any) =>
                  item.totalAmount?.subTotal !== item.totalAmount?.total
              )
                ? `
            <div class="total-row">
              <span>ADDITIONAL CHARGES:</span>
              <span>${formatBDT(
                order.totalAmount -
                  items.reduce(
                    (sum: number, item: any) =>
                      sum + (item.totalAmount?.subTotal || 0),
                    0
                  )
              )}</span>
            </div>
            `
                : ""
            }
              <!-- ✅ Added delivery charge row -->
            <div class="total-row">
              <span>DELIVERY CHARGE:</span>
              <span>${formatBDT(deliveryCharge)}</span>
            </div>

            ${
              items.some(
                (item: any) =>
                  item.totalAmount?.subTotal !== item.totalAmount?.total
              )
                ? `
              <div class="total-row">
                <span>ADDITIONAL CHARGES:</span>
                <span>${formatBDT(
                  order.totalAmount -
                    items.reduce(
                      (sum: number, item: any) =>
                        sum + (item.totalAmount?.subTotal || 0),
                      0
                    ) -
                    deliveryCharge
                )}</span>
              </div>
            `
                : ""
            }
            
            <div class="grand-total">
              <div class="total-row">
                <span>TOTAL AMOUNT:</span>
                <span>${formatBDT(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          ${
            order.orderNote
              ? `
          <div class="divider"></div>
          <div style="font-size: 11px; margin: 10px 0;">
            <div style="font-weight: bold; margin-bottom: 3px;">Note:</div>
            <div>${order.orderNote}</div>
          </div>
          `
              : ""
          }

          <!-- Footer -->
          <div class="footer">
            <div class="barcode">*${order._id
              .substring(order._id.length - 12)
              .toUpperCase()}*</div>
            <div class="thank-you">THANK YOU!</div>
            <div class="footer-line">For any queries, please contact us</div>
            <div class="footer-line">Keep this receipt for future reference</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Order Details</DialogTitle>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="ml-auto mr-8"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
          <DialogClose asChild></DialogClose>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 text-sm">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Order ID:</span> {order._id}
            </div>
            <div>
              <span className="font-medium">Created At:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Payment Method:</span>{" "}
              <span className="capitalize">{order.paymentInfo}</span>
            </div>
            <div>
              <span className="font-medium">Delivery Charge:</span>{" "}
              {formatBDT(deliveryCharge)}
            </div>
            <div>
              <span className="font-medium">Total Amount:</span>{" "}
              {formatBDT(order.totalAmount)}
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2">Customer Info</h4>
            <div>
              <div>
                <span className="font-medium">Name:</span>{" "}
                {order.customerInfo.firstName} {order.customerInfo.lastName}
              </div>
              {order.customerInfo.phone && (
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerInfo.phone}
                </div>
              )}
              {order.customerInfo.address && (
                <div className="col-span-2">
                  <span className="font-medium">Address:</span>{" "}
                  {order.customerInfo.address}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="border-t pt-3">
            <h4 className="font-semibold mb-3">Products</h4>

            <div className="space-y-3">
              {items.map((item: any, idx: number) => {
                const product = item.productInfo || {};
                const desc = product.description || {};
                const total = item.totalAmount || {};
                const commission = item.commission || {};

                return (
                  <Card key={idx} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h5 className="font-semibold text-base">
                              {desc.name}
                            </h5>
                            <Badge className={toStatusBadge(status)}>
                              {status}
                            </Badge>
                          </div>

                          <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Price:</span>{" "}
                              {formatBDT(item.selectedPrice)}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>{" "}
                              {item.quantity || 1}
                            </div>
                            <div>
                              <span className="font-medium">Sub Total:</span>{" "}
                              {formatBDT(total.subTotal)}
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>{" "}
                              {formatBDT(total.total)}
                            </div>
                          </div>

                          {/* Commission - ONLY visible in modal, NOT in print */}
                          {commission && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs border-t pt-2">
                              <div>
                                <span className="font-medium">Type:</span>{" "}
                                {commission.type}
                              </div>
                              <div>
                                <span className="font-medium">Value:</span>{" "}
                                {commission.value}
                                {commission.type === "percentage" ? "%" : ""}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span>{" "}
                                {formatBDT(commission.amount)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Order Note */}
          {order.orderNote && (
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-1">Order Note</h4>
              <p>{order.orderNote}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default function OrdersTable() {
  const userId = useSelector((state: any) => state.auth.user._id);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(userId);
  const { data: settingsData } = useGetSettingsQuery();
  const deliveryCharge = settingsData?.deliveryCharge || 0;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter((o) => {
        const fullName = `${o.customerInfo?.firstName ?? ""} ${
          o.customerInfo?.lastName ?? ""
        }`.toLowerCase();
        return (
          o._id.toLowerCase().includes(lower) ||
          fullName.includes(lower) ||
          o.customerInfo?.phone?.includes(lower)
        );
      });
    }

    if (status !== "ALL") {
      // 4. ✅ FIXED: Filter by o.status at the root
      result = result.filter(
        (o) => o.status?.toLowerCase() === status.toLowerCase()
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case "DATE_ASC":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "DATE_DESC":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "TOTAL_ASC":
          return a.totalAmount - b.totalAmount;
        case "TOTAL_DESC":
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, query, status, sort]);

  // 5. ✅ DELETED the 'orderStatuses' variable
  // const orderStatuses = orders.map((o) => o.status);

  if (isLoading) return <div>Loading orders...</div>;

  const handleView = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* ✅ Controls */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order id, customer name, phone…"
              className="w-full"
            />
          </div>

          <div>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="at-local-facility">
                  At Local Facility
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={sort} onValueChange={(v) => setSort(v)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="size-4" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_DESC">Date ↓ (new first)</SelectItem>
                <SelectItem value="DATE_ASC">Date ↑ (old first)</SelectItem>
                <SelectItem value="TOTAL_DESC">Total ↓ (high first)</SelectItem>
                <SelectItem value="TOTAL_ASC">Total ↑ (low first)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* 🖥️ Desktop Table View */}
      <Card className="border shadow-sm hidden md:block">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length ? (
                filteredOrders.map((order) => {
                  const name = `${order.customerInfo.firstName ?? ""} ${
                    order.customerInfo.lastName ?? ""
                  }`.trim();
                  return (
                    <TableRow key={order._id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{name || "-"}</span>
                          {order.customerInfo.phone && (
                            <span className="text-xs text-muted-foreground">
                              {order.customerInfo.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {/* ✅ FIX: Add a fallback value for undefined status */}
                        <Badge
                          className={toStatusBadge(order.status || "other")}
                        >
                          {order.status || "other"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatBDT(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleView(order)}
                        >
                          <Eye className="size-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 📱 Mobile Card View */}
      {/* ✅ Mobile View - Cards */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => {
          const name =
            `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim();
          // 7. ✅ FIXED: Get status from order.status
          const status = order.status || "other";

          return (
            <Card key={order._id} className="border shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-base">
                    {name || "Unknown"}
                  </h3>
                  <Badge className={toStatusBadge(status)}>{status}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Order ID:</span> {order._id}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerInfo.phone || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <p className="font-semibold text-green-700">
                    {formatBDT(order.totalAmount)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleView(order)}
                  >
                    <Eye className="size-4" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No orders found.
          </p>
        )}
      </div>

      {/* 🧾 Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        deliveryCharge={deliveryCharge}
        // 8. ✅ REMOVED the 'orderStatus' prop
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
