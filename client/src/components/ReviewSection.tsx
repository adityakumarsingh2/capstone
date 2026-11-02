import { useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ReviewSectionProps {
  productId: string;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = "default"
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "small" | "default" | "large";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    small: "h-3.5 w-3.5",
    default: "h-5 w-5",
    large: "h-6 w-6"
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-accent text-accent"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { reviews, isLoading, addReview, averageRating, reviewCount, userReview } = useReviews(productId);
  
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleSubmitReview = async () => {
    if (newRating === 0) return;
    
    await addReview.mutateAsync({
      productId,
      rating: newRating,
      title: newTitle || undefined,
      content: newContent || undefined,
    });
    
    setShowForm(false);
    setNewRating(0);
    setNewTitle("");
    setNewContent("");
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-8 p-6 bg-card rounded-2xl border border-border">
        {/* Average Rating */}
        <div className="text-center md:border-r border-border">
          <div className="font-display text-5xl font-semibold mb-2">{averageRating.toFixed(1)}</div>
          <StarRating rating={Math.round(averageRating)} size="default" />
          <p className="text-sm text-muted-foreground mt-2">Based on {reviewCount} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-3">{rating}</span>
              <Star className="h-4 w-4 fill-accent text-accent" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {user && !userReview && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
          <h3 className="font-display text-lg font-medium">Write Your Review</h3>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <StarRating 
              rating={newRating} 
              onRatingChange={setNewRating}
              interactive 
              size="large"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Review Title (optional)</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Review (optional)</label>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Tell others about your experience with this product"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="gold" 
              onClick={handleSubmitReview}
              disabled={newRating === 0 || addReview.isPending}
            >
              {addReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="p-6 bg-card rounded-2xl border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Customer</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="small" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              {review.isVerifiedPurchase && (
                <span className="text-xs text-accent font-medium px-2 py-1 bg-accent/10 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>

            {review.title && (
              <h4 className="font-medium mb-2">{review.title}</h4>
            )}
            {review.content && (
              <p className="text-muted-foreground text-sm leading-relaxed">{review.content}</p>
            )}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="h-4 w-4" />
                Helpful ({review.helpfulCount})
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
