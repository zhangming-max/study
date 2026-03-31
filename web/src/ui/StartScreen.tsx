export default function StartScreen(props: { onStart: () => void }) {
  return (
    <div style={{ padding: 16 }}>
      <h1>狼人杀网页小游戏</h1>
      <button onClick={props.onStart} aria-label="开始发牌">
        开始发牌
      </button>
    </div>
  )
}

