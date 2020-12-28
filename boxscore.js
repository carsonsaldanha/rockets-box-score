// Adds an on click event hanlder to the get JSON button
document.getElementById("getButton").addEventListener("click", function() {
    let dateFormatted = formatDate();
    let gameID = getGameID();
    // Formats the NBA data URL using the given information and opens the link in a new window for the user to save
    let url = "https://data.nba.com/json/cms/noseason/game/" + dateFormatted + "/" + gameID + "/boxscore.json";
    window.open(url);
}, false);

// Helper method that formats the inputted date without dashes
function formatDate() {
    let dateUnformatted = document.getElementById("date").value;
    let dateFormatted = "";
    // Loops through the unformatted date, appending each char to a new string except the dashes
    for (let i = 0; i < dateUnformatted.length; i++) {
        let currentChar = dateUnformatted[i];
        if (currentChar != "-") {
            dateFormatted += currentChar;
        }
    }
    return dateFormatted;
}

// Helper method that gets the game ID string from the inputted box score link
function getGameID() {
    const ID_START_INDEX = 36;
    let boxScoreLink = document.getElementById("boxScoreLink").value;
    let gameID = boxScoreLink.substring(ID_START_INDEX);
    return gameID;
}

let chooseFileButton = document.getElementById("chooseFile");

// Adds an on change event handler to the choose file button
chooseFileButton.addEventListener("change", function() {
    // Stores the file and creates a new FileReader object
    let file = chooseFileButton.files;
    let fileReader = new FileReader();
    // Uses the JSON to get the caption
    fileReader.onload = function(event) {
        // Gets the JSON data and stores it
        let data = JSON.parse(event.target.result);
        let gameStats = getHomeOrAwayStats(data);
        let sortedGameStats = gameStats.sort(compare);
        document.getElementById("caption").value = getCaption(sortedGameStats);
    }
    fileReader.readAsText(file.item(0));
}, false);

// Returns the Rockets' game stats based on if they were the home or away team
function getHomeOrAwayStats(data) {
    const TEAM_NAME = "Rockets";
    // Gets the nickname of the home team
    let homeTeam = data.sports_content.game.home.nickname;
    let gameStats;
    // Gets the home team's player stats if the Rockets are the home team
    if (homeTeam == TEAM_NAME) {
        gameStats = data.sports_content.game.home.players.player;
    // Gets the visitor team's player stats if the Rockets are the away team
    } else {
        gameStats = data.sports_content.game.visitor.players.player;
    }
    return gameStats;
}

// Compare method that helps sort the players in order based on points, then assists and rebounds if needed
function compare(playerOne, playerTwo) {
    // Gets the number of points for both players
    let playerOnePoints = parseInt(playerOne.points);
    let playerTwoPoints = parseInt(playerTwo.points);
    // Returns -1 if player one had more points than player two; 1 if player two had more points
    if (playerOnePoints > playerTwoPoints) {
        return -1;
    } else if (playerOnePoints < playerTwoPoints) {
        return 1;
    } else {
        // Gets the number of assists for both players
        let playerOneAssists = parseInt(playerOne.assists);
        let playerTwoAssists = parseInt(playerTwo.assists);
        // Returns -1 if player one had more assists than player two; 1 if player two had more assists
        if (playerOneAssists > playerTwoAssists) {
            return -1;
        } else if (playerOneAssists < playerTwoAssists) {
            return 1;
        } else {
            // Gets the total number of rebounds for both players
            let playerOneRebounds = parseInt(playerOne.rebounds_defensive) + parseInt(playerOne.rebounds_offensive);
            let playerTwoRebounds = parseInt(playerTwo.rebounds_defensive) + parseInt(playerTwo.rebounds_offensive);
            // Returns -1 if player one had more rebounds than player two; 1 if player two had more rebounds
            if (playerOneRebounds > playerTwoRebounds) {
                return -1;
            } else if (playerOneRebounds < playerTwoRebounds) {
                return 1;
            // Returns 0 for tie since both players have the same amount of points, assists, and rebounds
            } else {
                return 0;
            }
        }
    }
}

// Returns the formatted caption using the sorted game stats
function getCaption(sortedGameStats) {
    const MIN_PTS = 8;
    const MIN_AST = 5;
    const MIN_REB = 6;
    let caption = "";
    // Loops through the sorted game stats, creating the caption
    for (let i = 0; i < sortedGameStats.length; i++) {
        let player = sortedGameStats[i];
        // Gets the basic player stats
        let minutes = parseInt(player.minutes);
        let points = parseInt(player.points);
        let assists = parseInt(player.assists);
        let rebounds = parseInt(player.rebounds_defensive) + parseInt(player.rebounds_offensive);
        // Proceeds only if the player actually played and meets at least one of the minimum points, assists, or rebounds requirements
        if ((minutes > 0) && (points >= MIN_PTS || assists >= MIN_AST || rebounds >= MIN_REB)) {
            // Edge case scenario, removes "Jr." from Danuel House's last name
            if (player.jersey_number == "4") {
                caption += "#House ";
            // Appends the player's last name with a hashtag and a space to the caption
            } else {
                caption += "#" + player.last_name + " ";
            }
            caption = getBasicStats(caption, points, assists, rebounds, player);
            caption = getPercentageStats(caption, player);
            caption += "\n";
        }
    }
    // Removes the last newline character from the caption string
    return caption.slice(0, -1);
}

// Returns the caption with the player's points, assists, and/or rebounds appended to it
function getBasicStats(caption, points, assists, rebounds, player) {
    const MIN_VAL = 2;
    caption += points + "p";
    // Appends the assists if they meet the minimum value requirement
    if (assists >= MIN_VAL) {
        caption += "/" + assists + "a";
    }
    // Appends the rebounds if they meet the minimum value requirement
    if (rebounds >= MIN_VAL) {
        caption += "/" + rebounds + "r";
    }
    // Appends the blocks if they meet the minimum value requirement
    if (parseInt(player.blocks) >= MIN_VAL) {
        caption += "/" + player.blocks + "b";
    }
    // Appends the steals if they meet the minimum value requirement
    if (parseInt(player.steals) >= MIN_VAL) {
        caption += "/" + player.steals + "s";
    }
    return caption;
}

// Returns the caption with the player's percentage stats appended to it
function getPercentageStats(caption, player) {
    const MIN_SHOT = 0.42;
    const MIN_FGM = 5;
    const MIN_3PM = 3;
    const MIN_FTM = 8;
    let FGM = parseInt(player.field_goals_made);
    let FGA = parseInt(player.field_goals_attempted);
    let addFG = false;
    // Indicates that the FG percentages should be added
    if ((FGM >= MIN_FGM) && (FGM / FGA) >= MIN_SHOT) {
        addFG = true;
    }
    let TPM = parseInt(player.three_pointers_made);
    let TPA = parseInt(player.three_pointers_attempted);
    let add3PT = false;
    // Indicates that the 3PT percentages should be added
    if ((TPM >= MIN_3PM) && (TPM / TPA) >= MIN_SHOT) {
        add3PT = true;
    }
    let FTM = parseInt(player.free_throws_made);
    let FTA = parseInt(player.free_throws_attempted);
    let addFT = false;
    // Indicates that the FT percentages should be added
    if (FTM >= MIN_FTM) {
        addFT = true;
    }
    // Proceeds only if a percentage should be added
    if (addFG || add3PT || addFT) {
        caption += " (";
        // FG percentage needs to be added and possibly 3PT and FT percentage
        if (addFG) {
            caption += FGM + "-" + FGA + " FG";
            // 3PT percentage needs to be added
            if (add3PT) {
                caption += ", " + TPM + "-" + TPA + " 3PT";
            }
            // FT percentage needs to be added
            if (addFT) {
                caption += ", " + FTM + "-" + FTA + " FT";
            }
        // 3PT percentage needs to be added and possibly FT percentage
        } else if (add3PT) {
            caption += TPM + "-" + TPA + " 3PT";
            // FT percentage needs to be added
            if (addFT) {
                caption += ", " + FTM + "-" + FTA + " FT";
            }
        // FT percentage needs to be added
        } else if (addFT) {
            caption += FTM + "-" + FTA + " FT";
        }
        caption += ")";
    }
    return caption;
}

// Adds an on click event handler to the copy caption button
document.getElementById("copyButton").addEventListener("click", function() {
    // Selects the caption text area and copys it to the user's clipboard
    document.getElementById("caption").select();
    document.execCommand("copy");
}, false);