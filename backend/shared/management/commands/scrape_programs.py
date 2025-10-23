from django.core.management.base import BaseCommand
from shared.models import Program
import requests
from bs4 import BeautifulSoup
import time


class Command(BaseCommand):
    help = "Scrape UQ programs from the official website and populate the Program table."

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing programs',
        )

    def handle(self, *args, **options):
        force_update = options['force']
        
        # URLs to scrape
        urls = {
            'UNDERGRAD': 'https://programs-courses.uq.edu.au/browse.html?level=ugpg',
            'POSTGRAD': 'https://programs-courses.uq.edu.au/browse.html?level=pgpg'
        }
        
        for level, url in urls.items():
            self.stdout.write(f"Scraping {level} programs from {url}")
            
            try:
                # Add headers to mimic a real browser
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find the appropriate column based on level
                if level == 'UNDERGRAD':
                    column_selector = 'td:nth-child(1)'  # Undergraduate Program column
                else:
                    column_selector = 'td:nth-child(2)'  # Postgraduate Program column
                
                # Find all program names in the specified column
                program_elements = soup.select(f'table tr {column_selector}')
                
                programs_added = 0
                programs_updated = 0
                
                for element in program_elements:
                    program_name = element.get_text(strip=True)
                    
                    # Skip empty or header rows
                    if not program_name or program_name in ['Program', 'Undergraduate Program', 'Postgraduate Program']:
                        continue
                    
                    # Clean up the program name
                    program_name = program_name.replace('\n', ' ').replace('\t', ' ')
                    program_name = ' '.join(program_name.split())  # Remove extra whitespace
                    
                    if not program_name:
                        continue
                    
                    # Create or update the program
                    program, created = Program.objects.get_or_create(
                        name=program_name,
                        defaults={'level': level}
                    )
                    
                    if created:
                        programs_added += 1
                        self.stdout.write(f"  Added: {program_name}")
                    elif force_update:
                        program.level = level
                        program.save()
                        programs_updated += 1
                        self.stdout.write(f"  Updated: {program_name}")
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully processed {level} programs: "
                        f"{programs_added} added, {programs_updated} updated"
                    )
                )
                
                # Be respectful to the server
                time.sleep(1)
                
            except requests.RequestException as e:
                self.stdout.write(
                    self.style.ERROR(f"Failed to fetch {url}: {e}")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error processing {level} programs: {e}")
                )
        
        # Display summary
        total_programs = Program.objects.count()
        undergrad_count = Program.objects.filter(level='UNDERGRAD').count()
        postgrad_count = Program.objects.filter(level='POSTGRAD').count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\nSummary:\n"
                f"Total programs: {total_programs}\n"
                f"Undergraduate: {undergrad_count}\n"
                f"Postgraduate: {postgrad_count}"
            )
        )
