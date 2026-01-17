export default defineEventHandler(async (event) => {
    // This could read from a JSON file, but for now we'll serve a static object
    // that is easily editable here.

    // In a real file-based system, we would do:
    // const data = await fs.readFile('./content/lames.json', 'utf-8')
    // return JSON.parse(data)

    const lames = [
        {
            id: 1,
            type: 'ascii',
            content: `
       .  .
     .          .
   .          .
     .      .
       .  .
        ..
       .  .
      .    .
            `,
            caption: 'The Void'
        },
        {
            id: 2,
            type: 'joke',
            content: 'Why do programmers prefer dark mode? Because light attracts bugs.',
            caption: 'Classic'
        },
        {
            id: 3,
            type: 'joke',
            content: 'QA Engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 999999999 beers. Orders a lizard. Orders -1 beers. Orders a ueicbksjdhd. First real customer walks in and asks where the bathroom is. The bar bursts into flames, killing everyone.',
            caption: 'QA Life'
        },
        {
            id: 4,
            type: 'ascii',
            content: `
      /\\_/\\
     ( o.o )
      > ^ <
            `,
            caption: 'Neko'
        },
        {
            id: 5,
            type: 'text',
            content: 'If you think you are too small to make a difference, try sleeping with a mosquito.',
            caption: 'Dalai Lama'
        },
        {
            id: 6,
            type: 'text',
            content: 'Everything is a widget if you are brave enough.',
            caption: 'Vue Devs'
        }
    ]

    return {
        lames
    }
})
