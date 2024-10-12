export class Menu extends Phaser.Scene {
	constructor() {
		super('Menu')
	}

	create() {
		this.add.image(0, 0, 'menu').setOrigin(0)
		this.input.keyboard.once('keydown-SPACE', () => {
			this.scene.start('Rhythm', { song: 'song6' })
			//this.scene.start('Game', { level: 'house1', x: 0, y: 0, dialog: ['Son! can you com down', 'please??'] })
		})
	}
}
