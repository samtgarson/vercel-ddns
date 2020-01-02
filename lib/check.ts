import axios from 'axios'
import Commander from 'commander'

const program = new Commander.Command()

program
  .requiredOption('-t, --token <token>', 'Your Zeit API token.')
  .parse(process.argv)

const check = async (token: string) => {

  const { data: ip } = await axios.get('https://wtfismyip.com/text')

  console.log({ token, ip })
}

const { token } = program
check(token)


