import { Game } from './Game'

export default class Player extends Phaser.Physics.Arcade.Sprite {
	speed: number
	declare scene: Game
	constructor(scene: Game, x: number, y: number) {
		super(scene, x, y, 'player')
		this.setOrigin(0, 0)
		this.scene.add.existing(this)
		this.scene.physics.add.existing(this)
		this.speed = 60
		this.setSize(10, 16)
	}
	update() {
		this.setVelocity(0)
		if (this.scene.keys.W.isDown) {
			this.play('walk_back', true)
			this.setVelocityY(-this.speed)
		} else if (this.scene.keys.A.isDown) {
			this.play('walk_side', true)
			this.flipX = false
			this.setVelocityX(-this.speed)
		} else if (this.scene.keys.S.isDown) {
			this.play('walk_forward', true)
			this.setVelocityY(this.speed)
		} else if (this.scene.keys.D.isDown) {
			this.play('walk_side', true)
			this.flipX = true
			this.setVelocityX(this.speed)
		}
	}
}
