import { 
  trigger, 
  transition, 
  style, 
  animate, 
  state, 
  query, 
  stagger, 
  animateChild, 
  group 
} from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      stagger('100ms', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const slideInOutAnimation = trigger('slideInOutAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)' }),
    animate('300ms ease-in', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ transform: 'translateY(-100%)' }))
  ])
]); 