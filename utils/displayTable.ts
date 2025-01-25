const Table = require('cli-table');

export async function displayTable(wallets_created) {

    const chalk = require('chalk');
    
            //Display table

            for (const key in wallets_created) {
                const token_name = wallets_created[key].token_info.token_name;
                const token_symbol = wallets_created[key].token_info.token_symbol;
                const wallets = wallets_created[key].wallets;
                const sol_balances = wallets_created[key].sol_balances;
                const wsol_balances = wallets_created[key].wsol_balances;
                const token_balances = wallets_created[key].token_balances;

                // | 'black'
                // | 'red'
                // | 'green'
                // | 'yellow'
                // | 'blue'
                // | 'magenta'
                // | 'cyan'
                // | 'white'
                // | 'gray'
                // | 'grey'
                // | 'blackBright'
                // | 'redBright'
                // | 'greenBright'
                // | 'yellowBright'
                // | 'blueBright'
                // | 'magentaBright'
                // | 'cyanBright'
                // | 'whiteBright';

                console.log(`\nMint: ${key}` + ` (${chalk.magenta(token_name)} - ${chalk.magenta(token_symbol)}) ` +  '|' + ` Creation Count: ${chalk.green.bold(wallets.length)}`);

                const table = new Table({
                    head: [chalk.blueBright('Wallet'), chalk.blueBright('SOL Balance'), chalk.blueBright('WSOL Balance'), chalk.blueBright('Token Balance')]
                });

                for (let i = 0; i < wallets.length; i++) {
                    table.push([wallets[i], sol_balances[i], wsol_balances[i].toFixed(4), token_balances[i].toFixed(4)]);
                }

                
                console.log(table.toString());
            }
}