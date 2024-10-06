import { TEXT_STYLE } from '../utils'

export class Progress extends Phaser.Scene {
	creatures: string[]
	creatureBg: Phaser.GameObjects.Image
	creatureImages: Phaser.GameObjects.Image[]
	constructor() {
		super({ key: 'Progress' })
	}
	create() {
		this.creatureImages = []
		this.creatures = []
		this.creatureBg = this.add.image(0, 116, 'creature-bg').setOrigin(0).setZ(10)
	}
	update(): void {}
	async showDialog(dialog: string[]) {
		let dialogBox = this.add.rectangle(0, 0, 128, 32, 0x000000).setOrigin(0).setZ(20)
		let dialogText = this.add.text(4, 4, dialog.join('\n'), TEXT_STYLE).setResolution(10).setOrigin(0).setZ(21)

		dialogBox.setSize(128, dialogText.height + 8)
		dialogText.y = dialogBox.y + 4
		dialogText.x = dialogBox.x + 4
		await new Promise<void>((resolve) => {
			this.input.keyboard.once('keydown-SPACE', () => {
				dialogBox.destroy()
				dialogText.destroy()
				resolve()
			})
		})
	}
	hideTinymon(hide: boolean) {
		if (hide) {
			this.creatureImages.forEach((creature) => {
				creature.alpha = 0
			})
			this.creatureBg.alpha = 0
		} else {
			this.creatureImages.forEach((creature) => {
				creature.alpha = 1
			})
			this.creatureBg.alpha = 1
		}
	}
	addTinymon() {
		this.creatures.push('creature' + (this.creatures.length + 1))

		let tinymon = this.add
			.image(this.cameras.main.width / 2, this.cameras.main.height / 2, this.creatures[this.creatures.length - 1])
			.setOrigin(0.5)
			.setZ(20)
		this.tweens.add({
			targets: tinymon,
			scale: 2,
			duration: 500,
			ease: 'Quad.easeInOut',
			yoyo: true,
			onComplete: () => {
				this.tweens.add({
					targets: tinymon,
					x: this.creatures.length * 12,
					y: 116,
					duration: 500,
					ease: 'Quad.easeInOut',
					onComplete: () => {
						this.creatures.forEach((creature, i) => {
							this.creatureImages.push(
								this.add
									.image(i * 12, 116, creature)
									.setOrigin(0)
									.setZ(11 + i)
							)
						})
						tinymon.destroy()
					},
				})
			},
		})
	}
}
