import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import Stripe from 'stripe';

import { envs, NATS_SERVICE } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);
    private readonly logger = new Logger('PaymentService');

    constructor(
        @Inject(NATS_SERVICE)
        private readonly client: ClientProxy
    ) { }

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
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl
        });

        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        };
    }

    async stripeWebHook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;

        // Al ejecutar el cli del stripe se obtiene endpointSecret
        const endpointSecret = envs.stripeEndpointSecret;

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
            return;
        }

        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceded = event.data.object;
                const payload = {
                    stripePaymentId: chargeSucceded.id,
                    orderId: chargeSucceded.metadata.orderId,
                    receiptUrl: chargeSucceded.receipt_url,
                }

                this.client.emit('payment.succeeded', payload);
                break;
            default:
                console.log('Evento no controlado');
                break;
        }

        return res.status(200).json({ sig });
    }
}
