import { Injectable } from '@nestjs/common';
import { Command, Context, On, Start, Update } from 'nestjs-telegraf';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface OrderResponse {
  id: number;
  memo: string | null;
  user: {
    id: number;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    birth_date: string | null;
  };
  status: string;
  totalPrice: string;
  shippingPrice: string;
  discount: string | null;
  discountPrice: string | null;
  paymentMethod: {
    id: string;
    name: string;
    code: string;
    description: string;
  };
  shippingMethod: {
    id: number;
    name: string;
    description: string;
    cashOnDelivery: boolean;
    price: string;
    cities: any[] | null;
  };
  paymentGateway: {
    id: string;
    minAmountToPayment: string | null;
    maxAmountToPayment: string | null;
    code: string;
    key: string;
    active: boolean;
    installment: boolean;
    name: string;
    description: string | null;
    logoId: string;
    logo: {
      id: string;
      name: string;
      alt: string;
      local: boolean;
    };
    created_at: string;
    updated_at: string;
  };
  shippingAddress: {
    id: string;
    recipientFirstName: string;
    recipientLastName: string;
    recipientPhoneNumber: string;
    address: string;
    lat: string | null;
    long: string | null;
    city: {
      id: string;
      name: string;
      lat: string;
      long: string;
      zoom: string;
    };
    province: {
      id: string;
      name: string;
      lat: string;
      long: string;
      zoom: string;
    };
    postalCode: string;
  };
  items: Array<{
    id: number;
    product: {
      id: string;
      code: string;
      title: string;
      title_en: string;
      mainImage: {
        id: string;
        name: string;
        alt: string;
        address: string;
      };
    };
    productTitle: string;
    productTitleEn: string;
    variantId: number;
    variantGuaranteeId: number;
    variantGuaranteeTitle: string;
    variantColorHex: string;
    variantColorTitle: string;
    variantMaterial: string | null;
    variantSize: string | null;
    quantity: number;
    unitPrice: string;
    discountPrice: string | null;
    totalPrice: string;
    warehouseId: number;
    warehouse: {
      id: number;
      title: string;
      code: string;
      active: boolean;
      created_at: string;
      updated_at: string;
    };
    warehouseTargetProductId: string;
    warehouseTargetProductVariantId: string | null;
    warehouseTargetDescription: string | null;
  }>;
  orderItemActions: any[];
  payments: Array<{
    id: number;
    orderId: number;
    paymentToken: string | null;
    refNumber: string;
    cardNumber: string;
    amount: string;
    paymentMethodId: string;
    gatewayId: string;
    transactionId: string;
    paymentDate: string;
    failedReason: string | null;
    failedDate: string | null;
    gatewayEntryTime: string;
    created_at: string;
    gateway: {
      id: string;
      minAmountToPayment: string | null;
      maxAmountToPayment: string | null;
      code: string;
      key: string;
      active: boolean;
      installment: boolean;
      name: string;
      description: string | null;
      logoId: string;
      created_at: string;
      updated_at: string;
    };
    status: string;
    paymentMethod: {
      id: string;
      name: string;
      code: string;
      description: string;
      active: boolean;
      createdAt: string;
      updatedAt: string;
    };
    bankName: string;
  }>;
  history: Array<{
    id: number;
    oldStatus: string;
    newStatus: string;
    created_at: string;
    note: string | null;
  }>;
  initialDate: string;
  created_at: string;
  updated_at: string;
  paymentSeen: boolean;
  deliveryTrackingCode: string | null;
  cart: {
    id: string;
    subtotal: string;
    discountAmount: string;
    totalPrice: string;
    cartItems: Array<{
      id: number;
      quantity: number;
      unitPrice: string;
      discountPrice: string | null;
      totalPrice: string;
      offerId: string | null;
      offer: any | null;
      productId: string;
      product: {
        id: string;
        code: string;
        title: string;
        title_en: string;
        mainImage: {
          id: string;
          name: string;
          alt: string;
          address: string;
        };
      };
      variantId: number;
      variant: {
        id: number;
        allowAutoOffer: boolean;
        productId: string;
        colorId: number;
        color: {
          id: number;
          title: string;
          hex: string;
        };
        guaranteeId: number;
        guarantee: {
          id: number;
          title: string;
          created_at: string;
          updated_at: string;
        };
        warehouseTargetProductId: string;
        warehouseTargetProductVariantId: string | null;
        warehouseTargetDescription: string | null;
        material: string | null;
        size: string | null;
        purchasePrice: string;
        stock: number;
        maxBasketCount: number;
        price: string;
        active: boolean;
        created_at: string;
        updated_at: string;
      };
    }>;
  };
  itemsWarehouse: string;
}

@Injectable()
@Update()
export class BotService {
  constructor(private readonly httpService: HttpService) {}

  @Start()
  async start(@Context() ctx: any) {
    await ctx.reply('Welcome to PinkSense Bot! 👋');
  }

  @Command('order')
  async order(@Context() ctx: any) {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Please provide an ID. Usage: /order <id>');
      return;
    }

    const id = args[1];
    if (!/^\d+$/.test(id)) {
      await ctx.reply('Please provide a valid numeric ID');
      return;
    }
    await ctx.reply('در حال دریافت اطلاعات سفارش...');

    try {
      const response = await firstValueFrom(
        this.httpService.get<OrderResponse>(
          `https://api.zibasi.ir/orders/${id}?token=789456132`,
        ),
      );

      const order = response.data;
      let message = '';

      if (!order.shippingAddress) {
        throw new Error('Shipping address not found');
      }

      const pinkSenseItems = order.items.filter((item) => {
        return item.warehouseId === 2;
      });

      if (pinkSenseItems.length < 1) {
        throw new Error('No pinkSense items found');
      }

      const images = [
        ...new Set(
          pinkSenseItems.map((item) => {
            return item.product.mainImage.address;
          }),
        ),
      ];

      message += ` 🛍️ اقلام سفارش:`;
      message += `\n`;

      pinkSenseItems.forEach((item) => {
        let link = `https://pinksense.ir/product/${item.warehouseTargetProductId}`;
        if (item.warehouseTargetProductVariantId) {
          link += `?vid=${item.warehouseTargetProductVariantId}`;
        }
        message += `- <a href="${link}">${item.productTitle}</a> | <strong>${item.variantColorTitle}</strong> ${item.variantSize ? ` | <strong>${item.variantSize}</strong>` : ''} ${item.variantMaterial ? ` | <strong>${item.variantMaterial}</strong>` : ''} (${item.quantity} عدد) \n`;
      });
      message += `\n`;

      message += `👤 تحویل گیرنده: `;
      message += `\n`;
      message += ` ${order.shippingAddress.recipientFirstName} ${order.shippingAddress.recipientLastName}`;
      message += `\n`;
      message += `${order.shippingAddress.recipientPhoneNumber}`;
      message += `\n`;
      message += `${order.shippingAddress.province.name} - ${order.shippingAddress.city.name} - ${order.shippingAddress.address}`;
      message += `\n`;
      if (order.shippingAddress.postalCode) {
        message += `\n`;
        message += `کد پستی: ${order.shippingAddress.postalCode || '-'}`;
        message += `\n`;
      }
      message += `\n`;
      message += `👤 فرستنده : `;
      message += `\n`;
      message += ` فروشگاه زیباسی`;
      message += `\n`;
      message += ` محمد امین پاسبان`;
      message += `\n`;
      message += `09146672256`;

      message += `\n`;
      message += `\n`;
      message += `📦 سفارش شماره ${order.id}`;

      message += `\n`;
      message += `\n`;
      message += `\n`;
      message += `\n`;
      // Send images as gallery with caption
      if (images.length > 0) {
        const mediaGroup = images.map((imageUrl, index) => ({
          type: 'photo',
          media: imageUrl,
          caption: index === 0 ? message : undefined, // Only add caption to the first image
          parse_mode: 'HTML',
        }));

        await ctx.replyWithMediaGroup(mediaGroup);
      } else {
        await ctx.reply(message, { parse_mode: 'HTML' });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      await ctx.reply('متاسفانه خطایی در دریافت اطلاعات سفارش رخ داد.');
    } finally {
      return;
    }
  }

  @On('text')
  async onMessage(@Context() ctx: any) {
    await ctx.reply('you said : ' + ctx.message.text);
    return;
  }
}
