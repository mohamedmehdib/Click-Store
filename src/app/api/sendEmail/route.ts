import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, cart, totalPrice } = await req.json();

    const emailContent = `
      <h1>New Order Alert</h1>
      <p>A new order has been placed by: <strong>${email}</strong></p>
      <p>Total Price: <strong>${totalPrice}</strong></p>
      <h2>Order Details:</h2>
      <ul>
        ${cart
          .map(
            (item: { name: string; quantity: number; price: number }) =>
              `<li>${item.name} (Quantity: ${item.quantity}) - ${item.price} Dt</li>`
          )
          .join("")}
      </ul>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "team@clickstoretn.com",
        to: ["clickstoretunisie@gmail.com"],
        subject: "New Order Received",
        html: emailContent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: responseData }, { status: response.status });
    }

    return NextResponse.json({ success: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
