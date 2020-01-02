import Commander from 'commander'

const program = new Commander.Command()

program
  .requiredOption('-t, --token <token>', 'Your Zeit API token.')
  .parse(process.argv)

const run = async (token: string) => {
  console.log(token)
}

const { token } = program
run(token)



