export class Loading extends Phaser.Scene {
	songs: string[]
	img: string[]
	level: string[]
	npcs: string[]
	sprites: string[]
	constructor() {
		super('Loading')
		this.songs = ['song1', 'song2', 'song3', 'song4', 'song5', 'song6', 'comfy', 'overworld']
		this.img = ['rhythm-bg', 'rhythm-bg-2', 'tileset', 'creature-bg', 'blockade', 'menu']
		this.level = ['house1', 'house2', 'world1', 'house3', 'house4', 'house5']
		this.npcs = ['mom', 'amy', 'jones', 'mark', 'mary', 'alex']
		this.sprites = ['cursor']
	}

	preload() {
		this.load.setPath('assets')
		this.load.audio('click', 'click.ogg')
		this.songs.forEach((song) => {
			this.load.audio(song, `songs/${song}.mp3`)
			if (song.startsWith('song')) {
				this.load.json(song, `maps/${song}.json`)
			}
		})
		this.img.forEach((img) => {
			this.load.image(img, `img/${img}.png`)
		})
		this.load.aseprite('player', 'img/player/player.png', 'img/player/player.json')
		this.level.forEach((level) => {
			this.load.tilemapTiledJSON(level, `tiled/${level}.json`)
		})
		this.npcs.forEach((npc) => {
			this.load.aseprite(npc, `img/npcs/${npc}.png`, `img/npcs/${npc}.json`)
		})
		this.sprites.forEach((sprite) => {
			this.load.aseprite(sprite, `img/sprites/${sprite}.png`, `img/sprites/${sprite}.json`)
		})
		for (let i = 1; i < 7; i++) {
			this.load.image('creature' + i, `img/creatures/${i}.png`)
		}
	}

	create() {
		this.scene.run('Progress')
		this.anims.createFromAseprite('player')
		this.npcs.forEach((npc) => {
			this.anims.createFromAseprite(npc)
		})
		//this.scene.start('Game', { level: 'house1' })
		//this.scene.start('Rhythm', { song: 'song1' })
		//this.scene.start('Game', { level: 'world1' })
		this.scene.start('Menu')
	}
}
