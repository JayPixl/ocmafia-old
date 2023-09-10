import { GameCharacterStatus, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    let updates: any[] = [];
    (await prisma.game.findMany()).map(async game => {
        // const status = (await prisma.phaseCharacterGameStatus.findUnique({
        //     where: {
        //         id: phaseCharacterGameStatus.id
        //     }
        // }))?.status

        // const newStatus: {
        //     characterId: string;
        //     characterName: string;
        //     status: GameCharacterStatus;
        // }[] = []

        // status?.map(s => {
        //     if (newStatus.filter(t => t.characterId === s.characterId).length === 0) newStatus.push(s)
        // })

        const update = await prisma.game.updateMany({
            where: {
                name: "Test Game 2"
            },
            data: {

            }
        })


        updates.push(update)
    })
    console.log(updates)
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })