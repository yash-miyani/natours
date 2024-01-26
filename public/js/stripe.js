import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51OacrMSCxDyBjaYKRAJRo1Qll4MWY76WzjXjHJa5QGZcdELHlbohUTkFFLiN4w9awp635KjmLQwpvHSpriuauvEE00FUXl39DZ',
);

export const bookTour = async (tourId) => {
  try {
    //1) Get cheakout session from api
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(session);
    //2) Create cheakout from + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
