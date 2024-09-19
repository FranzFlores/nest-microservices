import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('/create-payment-session')
  createPaymentSession() {
    return '';
  }

  @Get('/success')
  success() {
    return {
      ok: true,
      message: 'Pago existoso'
    }
  }

  @Get('/cancel')
  cancel() {
    return {
      ok: true,
      message: 'Pago existoso'
    }
  }

  @Post('/webhook')
  async stripeWebhook() {
    return ''
  }
}
