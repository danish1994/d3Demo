import {Component} from '@angular/core';
import * as d3 from 'd3';
import * as interact from 'interactjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  svg;
  polygonWidth = 30;
  lineStroke = 3;
  selectedPoint;
  polygons = [];
  links = [];

  ngOnInit() {
    this.svg = d3.select('svg');

    this.addPolygon(Math.random() * 500, Math.random() * 500);
    this.addPolygon(Math.random() * 500, Math.random() * 500);

    this.initInteractJs();
    this.updateSVG();
  }

  initInteractJs() {
    interact('.draggable')
      .draggable({
        inertia: true,
        autoScroll: true,
        onmove: this.dragMove.bind(this),
      });
  }

  dragMove(event) {
    const target = event.target,
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
      i = target.getAttribute('index');

    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    this.updatePolygonPosition(i, x, y);
  }

  polygonClick(i) {
    console.log(i);
    if (this.selectedPoint !== undefined) {
      if (this.selectedPoint !== i) {
        this.addLink(this.selectedPoint, i);
      }
      this.polygons[this.selectedPoint].isSelected = false;
      this.selectedPoint = undefined;
    } else {
      this.selectedPoint = i;
      this.polygons[this.selectedPoint].isSelected = true;
    }
    this.updateSVG();
  }

  checkIfLinkExists(currentSource, currentTarget) {
    return !!this.links.find(({source, target}) => {
      // return (currentSource === source && currentTarget === target) || (currentSource === target && currentTarget === source)
      return (currentSource === source && currentTarget === target)
    })
  }

  addLink(source, target) {
    if (!this.checkIfLinkExists(source, target)) {
      this.links.push({
        source,
        target
      });
      this.updateSVG();
    }
  }

  removeLink(i) {
    this.links.splice(i, 1);
    this.updateSVG();
  }

  getCoordinateByIndex(index) {
    const polygon = this.findPolygonByIndex(index);
    if (polygon) {
      return {
        x: polygon.x,
        y: polygon.y
      };
    }
  }

  findPolygonByIndex(index) {
    return this.polygons[index];
  }

  updatePolygonPosition(i, x, y) {
    this.polygons[i].x = x;
    this.polygons[i].y = y;

    this.updateSVG();
  }

  addPolygon(x, y) {
    this.polygons.push(
      {
        x,
        y,
      }
    );

    this.updateSVG();
  }

  updateSVG() {
    this.svg.selectAll('polygon').remove();
    this.svg.selectAll('line').remove();

    this.links.map(({source, target}, i) => {
      source = this.getCoordinateByIndex(source);
      target = this.getCoordinateByIndex(target);

      if (source && target) {
        this.svg
          .append('line')
          .attr('stroke-width', this.lineStroke)
          .attr('stroke', 'black')
          .attr('x1', source.x)
          .attr('y1', source.y)
          .attr('x2', target.x)
          .attr('y2', target.y)
          .attr('marker-end', 'url(#arrow)')
          .on({
            'click': this.removeLink.bind(this, i)
          })

        ;
      }
    });

    this.polygons.map(({x, y, isSelected}, i) => {
      const points = [
        {x: x - this.polygonWidth / 2, y: y - this.polygonWidth / 2},
        {x: x + this.polygonWidth / 2, y: y - this.polygonWidth / 2},
        {x: x + this.polygonWidth / 2, y: y + this.polygonWidth / 2},
        {x: x - this.polygonWidth / 2, y: y + this.polygonWidth / 2}
      ];

      this.svg
        .append('polygon')
        .attr(
          'points',
          points
            .map(({x, y}) => {
              return [x, y].join(',');
            })
            .join(',')
        )
        .attr('class', 'draggable')
        .attr('index', i)
        .attr('data-x', x)
        .attr('data-y', y)
        .attr('fill', isSelected ? 'red' : 'black')
        .on({
          'click': this.polygonClick.bind(this, i)
        })
    });
  }

  addButton() {
    this.addPolygon(250, 250);
  }

  deleteBox() {
    if (this.selectedPoint !== undefined) {
      this.links = this.links.filter(({source, target}) => {
        return !(source === this.selectedPoint || target === this.selectedPoint);
      });

      this.links = this.links.map(({source, target}) => {
        if (source > this.selectedPoint) {
          source = source - 1;
        }

        if (target > this.selectedPoint) {
          target = target - 1;
        }

        return {
          source,
          target
        }
      });

      this.polygons[this.selectedPoint].isSelected = false;
      this.polygons.splice(this.selectedPoint, 1);
      this.selectedPoint = undefined;
      this.updateSVG();
    } else {
      alert('No Box Selected');
    }
  }
}
