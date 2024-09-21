import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100), // 20 dolares
                },
                quantity: item.quantity // Cantidad del producto
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            // Colocar el id de la orden
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3000/payments/success',
            cancel_url: 'http://localhost:3000/payments/cancel'
        });

        return session;
    }

    async stripeWebHook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;

        // Al ejecutar el cli del stripe se obtiene endpointSecret
        const endpointSecret = 'whsec_0d6294e98cf1839f71b5e7f662b3a1d9965b8e35c863ac427d7065679e9e8a24';

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
            return;
        }

        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceded = event.data.object;
                break;
            default:
                console.log('Evento no controlado');
                break;
        }

        return res.status(200).json({ sig });
    }
}
