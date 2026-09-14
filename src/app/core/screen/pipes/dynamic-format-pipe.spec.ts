import { DynamicFormatPipe } from './dynamic-format-pipe';

describe('DynamicFormatPipe integerTraffic', () => {
    function createPipe(): DynamicFormatPipe {
        const sanitizer: any = {
            bypassSecurityTrustHtml: (value: string) => value
        };
        return new DynamicFormatPipe(sanitizer, {} as any);
    }

    it('renders a green icon for zero and positive values', () => {
        const pipe = createPipe();
        const result = pipe.integerTraffic(0.4, { trafficFn: (value: number) => value < 0 ? 'red' : 'green' }) as string;

        expect(result).toContain('stg-green-icon');
        expect(result).toContain('0');
    });

    it('renders a red icon for negative values', () => {
        const pipe = createPipe();
        const result = pipe.integerTraffic(-1675.4, { trafficFn: (value: number) => value < 0 ? 'red' : 'green' }) as string;

        expect(result).toContain('stg-red-icon');
        expect(result).toContain('1,675');
    });

    it('rounds decimal values only at presentation', () => {
        const pipe = createPipe();

        expect(pipe.integer(3143.4, null)).toBe('3,143');
        expect(pipe.integer(4881.6, null)).toBe('4,882');
    });

    it('supports arrow indicators without changing the default dot indicator', () => {
        const pipe = createPipe();
        const result = pipe.integerTraffic(-675, {
            indicator: 'arrow',
            colorValue: true,
            trafficFn: () => 'red'
        }) as string;

        expect(result).toContain('▼');
        expect(result).toContain('675');
        expect(result).toContain('stg-red-text');
        expect(result).not.toContain('lens');
    });

    it('supports arrow indicators for percentages', () => {
        const pipe = createPipe();
        const result = pipe.percent(-0.2812, {
            indicator: 'arrow',
            colorValue: true,
            trafficFn: () => 'green'
        }) as string;

        expect(result).toContain('▼');
        expect(result).toContain('28.12%');
    });
});
