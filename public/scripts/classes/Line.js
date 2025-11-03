export default class Line {
  constructor(point1, point2, color) {
    this.point1 = point1;
    this.point2 = point2;
    this.color = color;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.point1.x, this.point1.y);
    ctx.lineTo(this.point2.x, this.point2.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke()

    this.drawArrow(ctx);
  }

  drawArrow(ctx) {
      const dx = this.point2.x - this.point1.x;
      const dy = this.point2.y - this.point1.y;
      //const headlen = Math.sqrt( dx * dx + dy * dy ) * 0.3; // length of head in pixels
      const headlen = 20;
      const angle = Math.atan2( dy, dx );
      ctx.beginPath();
      ctx.moveTo( this.point1.x, this.point1.y );
      ctx.lineTo( this.point2.x, this.point2.y );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo( this.point2.x - headlen * Math.cos( angle - Math.PI / 6 ), this.point2.y - headlen * Math.sin( angle - Math.PI / 6 ) );
      ctx.lineTo( this.point2.x, this.point2.y );
      ctx.lineTo( this.point2.x - headlen * Math.cos( angle + Math.PI / 6 ), this.point2.y - headlen * Math.sin( angle + Math.PI / 6 ) );
      ctx.stroke();
  }
}
