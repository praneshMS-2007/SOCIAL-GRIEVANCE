import './StarRating.css';

export default function StarRating({ rating, setRating, readonly = false }) {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
                    onClick={() => !readonly && setRating(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );
}
