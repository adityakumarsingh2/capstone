import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
              <CardDescription>
                Your payment was cancelled. No charges have been made.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your cart items are still saved. You can complete your purchase anytime.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={() => navigate('/cart')}>
                  Return to Cart
                </Button>
                <Button variant="outline" onClick={() => navigate('/shop')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutCancel;
