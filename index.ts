import program from 'commander'
import pkgJson from './package.json'
import { run } from './lib/run'
import { check } from './lib/check'
import { DDNSOptions } from './types/options'

program
  .version(pkgJson.version)
  .description('pkgJson.description')

program
  .command('check')
  .description('Error if Now DNS does not match your IP address')
  .requiredOption('-t, --token <token>', 'Your Now API token')
  .requiredOption('-d, --domainName <domainName>', 'The domain to check')
  .option('-n, --name <name>', 'The name of the record (or blank for root record)', '')
  .action(async (options: DDNSOptions) => {
    await check(options)
  })

program
  .command('run')
  .description('Update Now DNS with your IP address if it has changed')
  .requiredOption('-t, --token <token>', 'Your Now API token')
  .requiredOption('-d, --domainName <domainName>', 'The domain to check')
  .option('-n, --name <name>', 'The name of the record (or blank for root record)', '')
  .action(async (options: DDNSOptions) => {
    await run(options)
  })

const main = async () => {
  try {
    await program.parseAsync(process.argv)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

main()
