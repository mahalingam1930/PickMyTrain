import type { CompletedBooking } from "../app/context/BookingContext";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

export function printTicket(booking: CompletedBooking) {
  const passengers = booking.passengerDetails
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td>${booking.selectedSeats?.[i] || p.berth || "—"}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ticket - ${booking.bookingId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 32px; }
    .ticket { max-width: 680px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 28px 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #93c5fd; }
    .pnr-label { font-size: 11px; font-weight: 700; color: #bfdbfe; letter-spacing: 1px; margin-bottom: 4px; }
    .pnr { font-size: 22px; font-weight: 800; letter-spacing: 3px; }
    .status-badge { background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .journey { display: flex; align-items: center; gap: 20px; }
    .city { font-size: 28px; font-weight: 800; }
    .city-name { font-size: 12px; color: #bfdbfe; margin-top: 2px; }
    .line { flex: 1; height: 1px; background: rgba(255,255,255,0.3); }
    .duration { font-size: 11px; color: #bfdbfe; text-align: center; margin-bottom: 4px; }
    .divider { border: none; border-top: 2px dashed #e2e8f0; margin: 0 24px; }
    .body { padding: 24px 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .field-label { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px; }
    .field-value { font-size: 14px; font-weight: 600; color: #1e293b; }
    .field-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    h3 { font-size: 12px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .footer { background: #f8fafc; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; }
    .total-label { font-size: 12px; color: #64748b; }
    .total { font-size: 22px; font-weight: 800; color: #2563eb; }
    .note { font-size: 11px; color: #94a3b8; }
    .print-btn { text-align:center; margin-top:24px; }
    .print-btn button { padding:12px 32px; background:#2563eb; color:white; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; }
    @media print {
      body { background: white; padding: 0; }
      .ticket { box-shadow: none; border-radius: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="brand">PickMy<span>Train</span></div>
          <div style="font-size:11px;color:#bfdbfe;margin-top:4px;">E-Ticket / Booking Confirmation</div>
        </div>
        <div class="status-badge">${booking.status?.toUpperCase() || "CONFIRMED"}</div>
      </div>
      <div style="margin-bottom:16px;">
        <div class="pnr-label">PNR NUMBER</div>
        <div class="pnr">${booking.bookingId}</div>
      </div>
      <div class="journey">
        <div>
          <div class="city">${booking.selectedTrain?.departure || ""}</div>
          <div class="city-name">${booking.from}</div>
        </div>
        <div style="flex:1;text-align:center;">
          <div class="duration">${booking.selectedTrain?.duration || ""}</div>
          <div class="line"></div>
          <div style="font-size:11px;color:#bfdbfe;margin-top:4px;">${booking.date}</div>
        </div>
        <div style="text-align:right;">
          <div class="city">${booking.selectedTrain?.arrival || ""}</div>
          <div class="city-name">${booking.to}</div>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="body">
      <div class="grid">
        <div>
          <div class="field-label">TRAIN</div>
          <div class="field-value">${booking.selectedTrain?.name || "—"}</div>
          <div class="field-sub">#${booking.selectedTrain?.number || "—"}</div>
        </div>
        <div>
          <div class="field-label">CLASS</div>
          <div class="field-value">${classInfo[booking.selectedClass] || booking.selectedClass}</div>
          <div class="field-sub">${booking.selectedClass}</div>
        </div>
        <div>
          <div class="field-label">DATE</div>
          <div class="field-value">${booking.date}</div>
        </div>
        <div>
          <div class="field-label">PASSENGERS</div>
          <div class="field-value">${booking.passengers}</div>
        </div>
      </div>

      <h3>PASSENGER DETAILS</h3>
      <table>
        <thead>
          <tr>
            <th>#</th><th>NAME</th><th>AGE</th><th>GENDER</th><th>SEAT / BERTH</th>
          </tr>
        </thead>
        <tbody>${passengers}</tbody>
      </table>
    </div>

    <div class="footer">
      <div>
        <div class="total-label">TOTAL PAID</div>
        <div class="total">&#8377;${booking.totalFare?.toLocaleString()}</div>
      </div>
      <div style="text-align:right;">
        <div class="note">Booked on ${new Date(booking.bookedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        <div class="note" style="margin-top:4px;">Please carry a valid photo ID during travel.</div>
      </div>
    </div>
  </div>

  <div class="print-btn">
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    alert("Please allow popups to download/print the ticket.");
    URL.revokeObjectURL(url);
    return;
  }
  // Revoke the URL after the window loads to free memory
  win.addEventListener("load", () => URL.revokeObjectURL(url));
}
