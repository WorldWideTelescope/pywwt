class WWTModel:

    def center_on_coordinates(self, ra, dec, fov, instant=True):
        self.send_msg(event='center_on_coordinates',
                      ra=ra, dec=dec, fov=fov, instant=instant)
