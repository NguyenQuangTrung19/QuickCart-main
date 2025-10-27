// app/api/order/create/route.js

import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    // --- BẮT ĐẦU: CODE ĐÃ SỬA ---

    let amount = 0;
    // Dùng vòng lặp for...of để xử lý await đúng cách
    for (const item of items) {
      // item.product có thể là tên cũ, nếu bạn đã sửa ở client thì dùng item.products
      const product = await Product.findById(item.product || item.products);

      // Kiểm tra xem sản phẩm có tồn tại không để tránh lỗi
      if (product) {
        amount += product.offerPrice * item.quantity;
      } else {
        // Có thể ghi log lại để kiểm tra nếu cần
        console.warn(
          `Sản phẩm với ID ${
            item.product || item.products
          } không được tìm thấy. Bỏ qua.`
        );
      }
    }

    // --- KẾT THÚC: CODE ĐÃ SỬA ---

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount: amount + Math.floor(amount * 0.02),
        date: Date.now(),
      },
    });

    // Clear user cart
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
