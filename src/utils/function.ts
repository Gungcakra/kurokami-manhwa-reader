export function truncateTitle(title: string): string {
    if (title.length >= 25) {
      return title.substring(0, 20) + '...';
    }
    return title;
  }