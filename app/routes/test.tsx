import GameMessage from "~/components/game-message";


export default function Test() {
    return <div>
        <GameMessage actor={{ name: "Shadowdancer", id: '64a7490c4ca8def98475dea9' }}>
            @@ has been killed!
        </GameMessage>
    </div>
}