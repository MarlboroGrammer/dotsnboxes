const Side = {
    top: 1,
    right: 2,
    bottom: 3,
    left: 4
}

class Square {

    constructor(x, y, h, w) {
        this.w = w
        this.h = h
        this.bottom = y + h
        this.top = y
        this.right = x + w
        this.left = x
        this.owner = null
        this.selectedSidesCount = 0
        this.highlighted = null
        this.sideBottom = { owner: null, selected: false }
        this.sideLeft = { owner: null, selected: false }
        this.sideRight = { owner: null, selected: false }
        this.sideTop = { owner: null, selected: false }
    }



    hasMouseOver(mouseX, mouseY) {
        return mouseX > this.left &&
            mouseX <= this.right &&
            mouseY > this.top &&
            mouseY <= this.bottom
    }

    

    highlight(mouseX, mouseY) {
        let distanceTop = mouseY - this.top
        let distanceBottom = this.bottom - mouseY
        let distanceLeft = mouseX - this.left
        let distanceRight = this.right - mouseX
        let closest = Math.min(distanceBottom, distanceLeft, distanceRight, distanceTop);

        if (closest === distanceTop && !this.sideTop.selected)
            this.highlighted = Side.top

        else if (closest === distanceBottom && !this.sideBottom.selected)
            this.highlighted = Side.bottom
        else if (closest === distanceLeft && !this.sideLeft.selected)
            this.highlighted = Side.left
        else if (closest === distanceRight && !this.sideRight.selected)
            this.highlighted = Side.right

    }

    selectSide(player) {
        if (!this.highlighted) {
            return
        }
        switch (this.highlighted) {
            case Side.top:
                this.sideTop.owner = player
                this.sideTop.selected = true
                break
            case Side.right:
                this.sideRight.owner = player
                this.sideRight.selected = true
                break
            case Side.left:
                this.sideLeft.owner = player
                this.sideLeft.selected = true
                break
            case Side.bottom:
                this.sideBottom.owner = player
                this.sideBottom.selected = true
                break
            default:
                return
        }
        this.highlighted = null
        this.selectedSidesCount ++
        if (this.selectedSidesCount === 4) {
            this.owner = player
            return true
        }
        return false
    }
}

module.exports = {Square, Side}