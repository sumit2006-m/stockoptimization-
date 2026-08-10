from app import app

with app.app_context():
    try:
        tmpl = app.jinja_env.get_template('results.html')
        print('Template parsed successfully')
    except Exception as e:
        import traceback
        traceback.print_exc()