import Phaser from 'phaser'
import { Progress } from './Progress'
export class Credits extends Phaser.Scene {
	audio: Phaser.Sound.BaseSound
	constructor() {
		super('Credits')
	}

	create() {
		let progress = this.scene.get('Progress') as Progress
		this.audio = this.sound.add('song4')
		this.audio.play({ loop: true, volume: 0.5 })
		this.cameras.main.fadeIn(1000, 0, 0, 0)
		this.add
			.text(64, 64, 'Congrats!\nYou got all\nTinymons!', {
				fontFamily: 'pixel',
				fontSize: '12px',
				color: '#ffffff',
				lineSpacing: 10,
			})
			.setResolution(10)
			.setOrigin(0.5)
		this.input.keyboard.once('keydown-SPACE', () => {
			progress.creatures = []
			progress.creatureImages = []
			this.audio.stop()
			this.scene.start('Menu')
		})
	}
}
