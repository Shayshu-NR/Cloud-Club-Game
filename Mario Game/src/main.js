const game = new Phaser.Game(800, 600, Phaser.AUTO)
game.state.add("MenuScreen", Mario_Game.Menu)
game.state.add("SF_part_1", Mario_Game.SF_part_1)
game.state.add("SF_part_2", Mario_Game.SF_part_2)
game.state.add("SF_part_3", Mario_Game.SF_part_3)
game.state.start("MenuScreen")