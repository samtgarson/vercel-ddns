import program from 'commander'
import pkgJson from './package.json'

program
  .version(pkgJson.version)
  .description('Check and update Now DNS when your IP changes')
  .command('check', 'Error if Now DNS does not match your IP address', { executableFile: './lib/check.js' })
  .command('run', 'Update Now DNS with your IP address if it has changed', { executableFile: './lib/run.js' })
  .parse(process.argv)
