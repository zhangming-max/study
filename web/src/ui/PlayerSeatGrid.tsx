export default function PlayerSeatGrid(props: {
  seats: number[]
  onSeatClick?: (seat: number) => void
  revealedSeats?: Set<number>
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        marginTop: 12,
      }}
    >
      {props.seats.map((seat) => {
        const revealed = props.revealedSeats?.has(seat) ?? false
        return (
          <button
            key={seat}
            aria-label={`座位 ${seat}`}
            onClick={() => props.onSeatClick?.(seat)}
            disabled={props.onSeatClick ? revealed : false}
            style={{ opacity: revealed ? 0.6 : 1 }}
          >
            {revealed ? `座位 ${seat}（已交接）` : `座位 ${seat}`}
          </button>
        )
      })}
    </div>
  )
}

