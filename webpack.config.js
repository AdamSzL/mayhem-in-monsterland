const path = require('path');
module.exports = {
    entry: {
        index: './src/index.ts',
        Game: './src/Game.ts',
        WelcomeScreen: './src/WelcomeScreen.ts',
        Logo: './src/Logo.ts',
        helper: './src/helper.ts'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true
}
